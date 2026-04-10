import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, getPropAny, jsonResponse, errorResponse } from "./notion-helpers.mjs";

const STAGE_ORDER: Record<string, number> = { Commit: 0, Forecast: 1, Upside: 2, Pipeline: 3 };
const ACTIVE_STAGES = ["Pipeline", "Upside", "Forecast", "Commit"];

function extractPerson(page: any, ...propNames: string[]): string {
  for (const name of propNames) {
    const val = getProp(page, name);
    if (Array.isArray(val) && val.length > 0) return val[0];
    if (typeof val === "string" && val) return val;
  }
  return "Sin asignar";
}

export default async (req: Request, context: Context) => {
  try {
    // ── Active pipeline opportunities ──
    const filter = {
      or: ACTIVE_STAGES.map(stage => ({
        property: "Estado Oportunidad",
        select: { equals: stage }
      }))
    };

    const pages = await notionQueryAll(DB_IDS.FUNNEL, filter);

    const opportunities = pages.map((page: any) => {
      const stage = getProp(page, "Estado Oportunidad") || "Unknown";
      const industrias = getProp(page, "Industrias") || [];
      const pipelineDate = getProp(page, "PIPELINE DATE");
      const upsideDate = getProp(page, "UPSIDE DATE");

      let velocityDays: number | undefined;
      if (pipelineDate && upsideDate) {
        const diff = new Date(upsideDate).getTime() - new Date(pipelineDate).getTime();
        velocityDays = Math.round(diff / (1000 * 60 * 60 * 24));
        if (velocityDays < 0) velocityDays = undefined;
      }

      return {
        nombre: getProp(page, "Nombre Oportunidad") || "Sin nombre",
        stage,
        total: getProp(page, "$ Total Estimado (Sin IVA)") || 0,
        industria: industrias.length > 0 ? industrias[0] : "Sin clasificar",
        upselling: getProp(page, "Upselling") === true,
        cerrador: extractPerson(page, "Cerrador de Oportunidad", "Cerrador"),
        originador: extractPerson(page, "Originador de Oportunidad", "Originador", "Generador de Oportunidad", "Generador"),
        bo: extractPerson(page, "Business Owner", "BO", "Owner de Vertical"),
        duracion: getPropAny(page, "Duración", "Duracion", "Duration") || "",
        velocityDays,
      };
    });

    opportunities.sort((a: any, b: any) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99));

    // ── Won deals in 2026 ──
    const wonFilter = {
      and: [
        { property: "Estado Oportunidad", select: { equals: "Won" } },
        { property: "WON DATE", date: { on_or_after: "2026-01-01" } }
      ]
    };

    const wonPages = await notionQueryAll(DB_IDS.FUNNEL, wonFilter);
    const won2026 = wonPages.map((page: any) => {
      const industrias = getProp(page, "Industrias") || [];
      const wonDate = getProp(page, "WON DATE") || "";
      // Extract month from WON DATE (YYYY-MM-DD → YYYY-MM)
      const fecha = wonDate ? wonDate.slice(0, 7) : "";

      return {
        nombre: getProp(page, "Nombre Oportunidad") || "Sin nombre",
        total: getProp(page, "$ Total Estimado (Sin IVA)") || 0,
        cerrador: extractPerson(page, "Cerrador de Oportunidad", "Cerrador"),
        originador: extractPerson(page, "Originador de Oportunidad", "Originador", "Generador de Oportunidad", "Generador"),
        bo: extractPerson(page, "Business Owner", "BO", "Owner de Vertical"),
        industria: industrias.length > 0 ? industrias[0] : "Sin clasificar",
        fecha,
      };
    });

    return jsonResponse({ opportunities, won2026, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("api-opportunities error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/opportunities"
};
