import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQuery, getProp, getAllProps, jsonResponse, errorResponse } from "./notion-helpers.mjs";

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

// Paginate with a hard timeout (ms). Returns whatever was collected before timeout.
async function notionQueryWithTimeout(
  databaseId: string,
  filter: any,
  timeoutMs: number
): Promise<any[]> {
  const deadline = Date.now() + timeoutMs;
  let allResults: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore && Date.now() < deadline) {
    const data = await notionQuery(databaseId, filter, undefined, cursor);
    allResults = allResults.concat(data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return allResults;
}

interface MonthData {
  real: number;
  target: number;
  r2025: number;
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);

    // Debug mode: return database schema (no records, instant)
    if (url.searchParams.get("debug") === "1") {
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.FORECAST}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
        },
      });
      const dbMeta = await dbRes.json();
      const schema: Record<string, any> = {};
      if (dbMeta.properties) {
        for (const [name, prop] of Object.entries(dbMeta.properties) as any) {
          schema[name] = { type: prop.type };
          if (prop.type === "select" && prop.select?.options) {
            schema[name].options = prop.select.options.map((o: any) => o.name);
          }
          if (prop.type === "number") {
            schema[name].format = prop.number?.format;
          }
        }
      }
      return jsonResponse({ schema, title: dbMeta.title?.map((t: any) => t.plain_text).join("") });
    }

    // Query 2026 and 2025 in PARALLEL — each with its own 25s timeout
    const filter2026 = { property: "Año Facturación", select: { equals: "2026" } };
    const filter2025 = { property: "Año Facturación", select: { equals: "2025" } };

    const [pages2026, pages2025] = await Promise.all([
      notionQueryWithTimeout(DB_IDS.FORECAST, filter2026, 25000),
      notionQueryWithTimeout(DB_IDS.FORECAST, filter2025, 25000),
    ]);

    const pages = [...pages2026, ...pages2025];

    // Aggregate by month and year
    const data2026: Record<string, MonthData> = {};
    const industryRevenue: Record<string, number> = {};

    // Initialize months
    for (const m of Object.values(MONTH_MAP)) {
      if (!data2026[m]) {
        data2026[m] = { real: 0, target: 0, r2025: 0 };
      }
    }

    for (const page of pages) {
      const tipo = getProp(page, "Tipo");
      const mesFact = getProp(page, "Mes Facturación") || "";
      const anio = getProp(page, "Año Facturación") || "";
      const monto = getProp(page, "Monto Mensual") || 0;
      const industria = getProp(page, "Industria Fórmula") || "";
      const moneda = getProp(page, "Moneda") || "ARS";

      if (!mesFact || !anio || !monto) continue;

      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort) continue;

      const anioStr = String(anio);

      if (anioStr === "2026") {
        if (tipo === "Real") {
          data2026[mesShort].real += monto;
          // Track revenue by industry (only Real 2026)
          if (industria) {
            industryRevenue[industria] = (industryRevenue[industria] || 0) + monto;
          }
        } else if (tipo === "Target") {
          data2026[mesShort].target += monto;
        }
      } else if (anioStr === "2025" && tipo === "Real") {
        data2026[mesShort].r2025 += monto;
      }
    }

    // Build revenue array sorted by month
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

    // Build industry revenue array sorted by revenue desc
    const byIndustry = Object.entries(industryRevenue)
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);

    return jsonResponse({
      revenue,
      byIndustry,
      records: { total: pages.length, y2026: pages2026.length, y2025: pages2025.length },
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("api-revenue error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/revenue"
};
