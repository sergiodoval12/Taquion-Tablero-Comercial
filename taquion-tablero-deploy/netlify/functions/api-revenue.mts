import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, jsonResponse, errorResponse } from "./notion-helpers.mjs";

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

interface MonthData {
  real: number;
  target: number;
  r2025: number;
}

export default async (req: Request, context: Context) => {
  try {
    // Get all forecast records with Monto Mensual
    const filter = {
      property: "Monto Mensual",
      number: { is_not_empty: true }
    };

    const pages = await notionQueryAll(DB_IDS.FORECAST, filter);

    // Aggregate by month and year
    const data2026: Record<string, MonthData> = {};
    const data2025: Record<string, number> = {};

    // Initialize months
    Object.values(MONTH_MAP).forEach(m => {
      data2026[m] = { real: 0, target: 0, r2025: 0 };
      data2025[m] = 0;
    });

    for (const page of pages) {
      const tipo = getProp(page, "Tipo");
      const mesFact = getProp(page, "Mes Facturación");
      const anio = getProp(page, "Año Facturación");
      const monto = getProp(page, "Monto Mensual") || 0;

      if (!mesFact || !anio) continue;

      const mesShort = MONTH_MAP[mesFact];
      if (!mesShort) continue;

      if (anio === "2026") {
        if (tipo === "Real" || tipo === "Won") {
          data2026[mesShort].real += monto;
        } else if (tipo === "Target") {
          data2026[mesShort].target += monto;
        } else if (tipo === "Costos") {
          // Skip costs for revenue view
        }
      } else if (anio === "2025" && (tipo === "Real" || tipo === "Won")) {
        data2025[mesShort] = (data2025[mesShort] || 0) + monto;
      }
    }

    // Build response array sorted by month
    const currentMonth = new Date().getMonth() + 1; // 1-indexed
    const revenue = Object.entries(data2026)
      .map(([mes, d]) => ({
        mes,
        real: Math.round(d.real),
        target: Math.round(d.target),
        r2025: Math.round(data2025[mes] || 0),
        projected: MONTH_ORDER[mes] > currentMonth,
      }))
      .sort((a, b) => MONTH_ORDER[a.mes] - MONTH_ORDER[b.mes]);

    return jsonResponse({ revenue, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("api-revenue error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/revenue"
};
