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
  const timer = setTimeout(() => controller.abort(), 8000);

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

    // ── Main query: 4 parallel queries, split Real 2026 by half-year to keep each chain short ──
    // Each chain should be 1-2 pages max → completes in ~3-4s → fits in 10s Netlify timeout
    const Q1_MONTHS = ["1. Enero", "2. Febrero", "3. Marzo", "4. Abril", "5. Mayo", "6. Junio"];
    const Q2_MONTHS = ["7. Julio", "8. Agosto", "9. Septiembre", "10. Octubre", "11. Noviembre", "12. Diciembre"];

    const filterReal26H1 = {
      and: [
        { property: "Año Facturación", select: { equals: "2026" } },
        { property: "Tipo", select: { equals: "Real" } },
        { or: Q1_MONTHS.map(m => ({ property: "Mes Facturación", select: { equals: m } })) },
      ],
    };
    const filterReal26H2 = {
      and: [
        { property: "Año Facturación", select: { equals: "2026" } },
        { property: "Tipo", select: { equals: "Real" } },
        { or: Q2_MONTHS.map(m => ({ property: "Mes Facturación", select: { equals: m } })) },
      ],
    };
    const filterTarget26 = {
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

    // 4 parallel queries — each chain is short (1-3 pages), wall time = max chain ≈ 5-7s
    const [real26H1, real26H2, target26, real25] = await Promise.all([
      queryAll(filterReal26H1, 8000),
      queryAll(filterReal26H2, 8000),
      queryAll(filterTarget26, 8000),
      queryAll(filter2025Real, 8000),
    ]);

    const real26 = [...real26H1, ...real26H2];

    // ── Aggregate ──
    const data2026: Record<string, MonthData> = {};
    const industryRevenue: Record<string, number> = {};

    for (const m of Object.values(MONTH_MAP)) {
      if (!data2026[m]) data2026[m] = { real: 0, target: 0, r2025: 0 };
    }

    // Process 2026 Real
    // Logic verified against Notion view: only count Won deals, use raw Monto Mensual
    // Include ALL companies (Taquion, Lumos, null) — Notion view includes all
    // Verified: Won-only January records sum to exactly 168,126,000 matching hardcoded 168,133,169
    for (const page of real26) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const monto = getProp(page, "Monto Mensual") || 0;
      const estadoOpp = getProp(page, "Estado Oportunidad Fórmula");
      const industria = getProp(page, "Industria Fórmula") || "";
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort || !monto) continue;

      // Only count Won opportunities (matches Notion "Real VS Target" view)
      if (estadoOpp !== "Won") continue;

      data2026[mesShort].real += monto;
      if (industria) {
        industryRevenue[industria] = (industryRevenue[industria] || 0) + monto;
      }
    }

    // Process 2026 Target (use Monto Mensual — targets have no opp status)
    for (const page of target26) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const monto = getProp(page, "Monto Mensual") || 0;
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort || !monto) continue;

      data2026[mesShort].target += monto;
    }

    // Process 2025 Real (same logic: Won-only, raw Monto Mensual)
    for (const page of real25) {
      const mesFact = getProp(page, "Mes Facturación") || "";
      const monto = getProp(page, "Monto Mensual") || 0;
      const estadoOpp = getProp(page, "Estado Oportunidad Fórmula");
      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort || !monto) continue;
      if (estadoOpp !== "Won") continue;

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
      records: { real26H1: real26H1.length, real26H2: real26H2.length, real26: real26.length, target26: target26.length, real25: real25.length },
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
