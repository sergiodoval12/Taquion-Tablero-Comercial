import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, getAllProps, jsonResponse, errorResponse } from "./notion-helpers.mjs";

const MONTH_MAP: Record<string, string> = {
  "1. Enero": "Ene", "2. Febrero": "Feb", "3. Marzo": "Mar",
  "4. Abril": "Abr", "5. Mayo": "May", "6. Junio": "Jun",
  "7. Julio": "Jul", "8. Agosto": "Ago", "9. Septiembre": "Sep",
  "10. Octubre": "Oct", "11. Noviembre": "Nov", "12. Diciembre": "Dic",
  // Also try without number prefix
  "Enero": "Ene", "Febrero": "Feb", "Marzo": "Mar",
  "Abril": "Abr", "Mayo": "May", "Junio": "Jun",
  "Julio": "Jul", "Agosto": "Ago", "Septiembre": "Sep",
  "Octubre": "Oct", "Noviembre": "Nov", "Diciembre": "Dic",
};

const MONTH_ORDER: Record<string, number> = {
  "Ene": 1, "Feb": 2, "Mar": 3, "Abr": 4, "May": 5, "Jun": 6,
  "Jul": 7, "Ago": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dic": 12,
};

interface MonthData {
  real: number;
  target: number;
  r2025: number;
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);

    // Debug mode: return schema of first page
    if (url.searchParams.get("debug") === "1") {
      const pages = await notionQueryAll(DB_IDS.FORECAST, undefined, undefined);
      if (pages.length > 0) {
        const schema = getAllProps(pages[0]);
        return jsonResponse({ schema, totalPages: pages.length });
      }
      return jsonResponse({ schema: null, totalPages: 0 });
    }

    // Fetch only 2025 and 2026 records to avoid timeout
    // Try filtering by "Año Facturación" select property
    let pages: any[];
    try {
      const filter = {
        or: [
          { property: "Año Facturación", select: { equals: "2026" } },
          { property: "Año Facturación", select: { equals: "2025" } },
        ]
      };
      pages = await notionQueryAll(DB_IDS.FORECAST, filter);
    } catch (filterErr: any) {
      // If filter fails (property name mismatch), try without filter but limit pages
      console.warn("Year filter failed, trying with number filter:", filterErr.message);
      try {
        const filter = {
          or: [
            { property: "Año", select: { equals: "2026" } },
            { property: "Año", select: { equals: "2025" } },
          ]
        };
        pages = await notionQueryAll(DB_IDS.FORECAST, filter);
      } catch {
        // Last resort: no filter but only first 200 results
        console.warn("All year filters failed, querying without filter");
        pages = await notionQueryAll(DB_IDS.FORECAST, undefined);
      }
    }

    // Aggregate by month and year
    const data2026: Record<string, MonthData> = {};

    // Initialize months
    Object.values(MONTH_MAP).forEach(m => {
      if (!data2026[m]) {
        data2026[m] = { real: 0, target: 0, r2025: 0 };
      }
    });

    for (const page of pages) {
      const tipo = getProp(page, "Tipo");
      const mesFact = getProp(page, "Mes Facturación") || getProp(page, "Mes") || "";
      const anio = getProp(page, "Año Facturación") || getProp(page, "Año") || "";
      const monto = getProp(page, "Monto Mensual") || getProp(page, "Monto") || 0;

      if (!mesFact || !anio || !monto) continue;

      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort) continue;

      const anioStr = String(anio);

      if (anioStr === "2026") {
        if (tipo === "Real" || tipo === "Won") {
          data2026[mesShort].real += monto;
        } else if (tipo === "Target") {
          data2026[mesShort].target += monto;
        }
      } else if (anioStr === "2025" && (tipo === "Real" || tipo === "Won")) {
        data2026[mesShort].r2025 += monto;
      }
    }

    // Build response array sorted by month
    const currentMonth = new Date().getMonth() + 1;
    const revenue = Object.entries(data2026)
      .filter(([mes]) => MONTH_ORDER[mes]) // only valid months
      .map(([mes, d]) => ({
        mes,
        real: Math.round(d.real),
        target: Math.round(d.target),
        r2025: Math.round(d.r2025),
        projected: MONTH_ORDER[mes] > currentMonth,
      }))
      .sort((a, b) => MONTH_ORDER[a.mes] - MONTH_ORDER[b.mes]);

    return jsonResponse({ revenue, totalRecords: pages.length, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("api-revenue error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/revenue"
};
