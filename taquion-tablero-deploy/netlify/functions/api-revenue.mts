import type { Context, Config } from "@netlify/functions";
import { DB_IDS, getProp, getAllProps, jsonResponse, errorResponse } from "./notion-helpers.mjs";

const NOTION_VERSION = "2022-06-28";

const MONTH_MAP: Record<string, string> = {
  "1. Enero": "Ene", "2. Febrero": "Feb", "3. Marzo": "Mar",
  "4. Abril": "Abr", "5. Mayo": "May", "6. Junio": "Jun",
  "7. Julio": "Jul", "8. Agosto": "Ago", "9. Septiembre": "Sep",
  "10. Octubre": "Oct", "11. Noviembre": "Nov", "12. Diciembre": "Dic",
};

const MONTH_ORDER: Record<string, number> = {
  "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6,
  "Jul": 7, "Ago": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12,
};

// Direct Notion API call with hard 12s abort per request
async function queryNotion(filter: any, cursor?: string): Promise<any> {
  const apiKey = Netlify.env.get("NOTION_API_KEY");
  const body: any = { page_size: 100 };
  if (filter) body.filter = filter;
  if (cursor) body.start_cursor = cursor;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DB_IDS.FORECAST}/query`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Notion ${res.status}`);
    return res.json();
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}

// Paginate with a hard deadline. Returns what was collected.
async function queryAll(filter: any, deadlineMs: number): Promise<any[]> {
  const deadline = Date.now() + deadlineMs;
  let all: any[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore && Date.now() < deadline) {
    try {
      const data = await queryNotion(filter, cursor);
      all = all.concat(data.results || []);
      hasMore = data.has_more === true;
      cursor = data.next_cursor;
    } catch {
      break; // On any error, return what we have
    }
  }
  return all;
}

interface MonthData {
  real: number;
  target: number;
  r2025: number;
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);

    // Debug: return schema only (instant, no records)
    if (url.searchParams.get("debug") === "1") {
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.FORECAST}`, {
        headers: { "Authorization": `Bearer ${apiKey}`, "Notion-Version": NOTION_VERSION },
      });
      const dbMeta = await dbRes.json();
      const schema: Record<string, any> = {};
      if (dbMeta.properties) {
        for (const [name, prop] of Object.entries(dbMeta.properties) as any) {
          schema[name] = { type: prop.type };
          if (prop.type === "select" && prop.select?.options)
            schema[name].options = prop.select.options.map((o: any) => o.name);
        }
      }
      return jsonResponse({ schema, title: dbMeta.title?.map((t: any) => t.plain_text).join("") });
    }

    // Debug: return 3 sample records
    if (url.searchParams.get("debug") === "2") {
      const data = await queryNotion(undefined);
      const samples = (data.results || []).slice(0, 3).map((p: any) => getAllProps(p));
      return jsonResponse({ samples, total: data.results?.length });
    }

    // Debug 3: breakdown of January 2026 Real records to find duplicates
    if (url.searchParams.get("debug") === "3") {
      const filter = {
        and: [
          { property: "Año Facturación", select: { equals: "2026" } },
          { property: "Tipo", select: { equals: "Real" } },
          { property: "Mes Facturación", select: { equals: "1. Enero" } },
        ],
      };
      const pages = await queryAll(filter, 20000);
      const details = pages.map((p: any) => ({
        titulo: getProp(p, "FACTURACIÓN"),
        monto: getProp(p, "Monto Mensual"),
        moneda: getProp(p, "Moneda"),
        compania: getProp(p, "Compañía"),
        opp: getProp(p, "Nombre Oportunidad"),
        orgFormula: getProp(p, "Organización Fórmula"),
        estadoOpp: getProp(p, "Estado Oportunidad Fórmula"),
      }));
      const totalARS = details.filter(d => d.moneda === "ARS").reduce((s, d) => s + (d.monto || 0), 0);
      const byCompania: Record<string, number> = {};
      for (const d of details) {
        const key = d.compania || "(null)";
        byCompania[key] = (byCompania[key] || 0) + (d.monto || 0);
      }
      return jsonResponse({
        totalRecords: pages.length,
        totalARS,
        byCompania,
        details: details.sort((a: any, b: any) => (b.monto || 0) - (a.monto || 0)),
      });
    }

    // ── Main query: 3 parallel targeted queries ──
    // Each compound filter = Año + Tipo → much fewer records per query
    const filter2026Real = {
      and: [
        { property: "Año Facturación", select: { equals: "2026" } },
        { property: "Tipo", select: { equals: "Real" } },
      ],
    };
    const filter2026Target = {
      and: [
        { property: "Año Facturación", select: { equals: "2026" } },
        { property: "Tipo", select: { equals: "Target" } },
      ],
    };
    const filter2025Real = {
      and: [
        { property: "Año Facturación", select: { equals: "2025" } },
        { property: "Tipo", select: { equals: "Real" } },
      ],
    };

    // Run all 3 in parallel, each with 20s budget
    const [real26, target26, real25] = await Promise.all([
      queryAll(filter2026Real, 20000),
      queryAll(filter2026Target, 20000),
      queryAll(filter2025Real, 20000),
    ]);

    // ── Aggregate ──
    const data2026: Record<string, MonthData> = {};
    const industryRevenue: Record<string, number> = {};

    for (const m of Object.values(MONTH_MAP)) {
      if (!data2026[m]) data2026[m] = { real: 0, target: 0, r2025: 0 };
    }

    // Process 2026 Real
    // Use "Monto Mensual Ajustado" (Notion formula) instead of "Monto Mensual"
    // This automatically zeroes out Lost/Nurturing deals and adjusts Forecast (75%) and Upside (40%)
    // Exception: orphan records (no linked opportunity → null estadoOpp) with Tipo=Real
    //   → use raw Monto Mensual since they're real billing without an opp link
    // Exclude Lumos records to avoid duplicates (e.g. SUTERH appears as both Taquion + Lumos)
    for (const page of real26) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const montoAjustado = getProp(page, "Monto Mensual Ajustado") || 0;
      const montoRaw = getProp(page, "Monto Mensual") || 0;
      const estadoOpp = getProp(page, "Estado Oportunidad Fórmula");
      const compania = getProp(page, "Compañía");
      const industria = getProp(page, "Industria Fórmula") || "";
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort) continue;

      // Exclude Lumos (duplicates Taquion records)
      if (compania === "Lumos") continue;

      // Determine effective amount:
      // - If Monto Ajustado > 0, use it (handles Won=100%, Forecast=75%, Upside=40%, Lost/Nurturing=0)
      // - If Ajustado is 0 but estadoOpp is null/empty and raw > 0 → orphan billing record, use raw
      let monto = montoAjustado;
      if (!monto && !estadoOpp && montoRaw > 0) {
        monto = montoRaw;
      }
      if (!monto) continue;

      data2026[mesShort].real += monto;
      if (industria) {
        industryRevenue[industria] = (industryRevenue[industria] || 0) + monto;
      }
    }

    // Process 2026 Target (use Monto Mensual — targets don't need adjustment)
    for (const page of target26) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const monto = getProp(page, "Monto Mensual") || 0;
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort || !monto) continue;

      data2026[mesShort].target += monto;
    }

    // Process 2025 Real (same logic: Monto Ajustado with orphan fallback, exclude Lumos)
    for (const page of real25) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const montoAjustado = getProp(page, "Monto Mensual Ajustado") || 0;
      const montoRaw = getProp(page, "Monto Mensual") || 0;
      const estadoOpp = getProp(page, "Estado Oportunidad Fórmula");
      const compania = getProp(page, "Compañía");
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort) continue;
      if (compania === "Lumos") continue;

      let monto = montoAjustado;
      if (!monto && !estadoOpp && montoRaw > 0) {
        monto = montoRaw;
      }
      if (!monto) continue;

      data2026[mesShort].r2025 += monto;
    }

    // Build sorted arrays
    const currentMonth = new Date().getMonth() + 1;
    const revenue = Object.entries(data2026)
      .filter(([mes]) => MONTH_ORDER[mes])
      .map(([mes, d]) => ({
        mes,
        real: Math.round(d.real),
        target: Math.round(d.target),
        r2025: Math.round(d.r2025),
        projected: MONTH_ORDER[mes] > currentMonth,
      }))
      .sort((a, b) => MONTH_ORDER[a.mes] - MONTH_ORDER[b.mes]);

    const byIndustry = Object.entries(industryRevenue)
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);

    return jsonResponse({
      revenue,
      byIndustry,
      records: { real26: real26.length, target26: target26.length, real25: real25.length },
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("api-revenue error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/revenue",
};
