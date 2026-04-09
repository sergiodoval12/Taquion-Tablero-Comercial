import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, jsonResponse, errorResponse } from "./notion-helpers.mjs";

const STAGE_ORDER: Record<string, number> = { Commit: 0, Forecast: 1, Upside: 2, Pipeline: 3 };

const ACTIVE_STAGES = ["Pipeline", "Upside", "Forecast", "Commit"];

export default async (req: Request, context: Context) => {
  try {
    // Query funnel/opportunities database - only active stages
    const filter = {
      or: ACTIVE_STAGES.map(stage => ({
        property: "Estado Oportunidad",
        select: { equals: stage }
      }))
    };

    const pages = await notionQueryAll(DB_IDS.FUNNEL, filter);

    const opportunities = pages.map(page => {
      const stage = getProp(page, "Estado Oportunidad") || "Unknown";
      const industrias = getProp(page, "Industrias") || [];
      const cerrador = getProp(page, "Cerrador de Oportunidad") || [];
      const pipelineDate = getProp(page, "PIPELINE DATE");
      const upsideDate = getProp(page, "UPSIDE DATE");

      // Calculate velocity if both dates exist
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
        cerrador: cerrador.length > 0 ? cerrador[0] : "Sin asignar",
        duracion: getProp(page, "Duración") || "",
        velocityDays,
      };
    });

    // Sort: Commit > Forecast > Upside > Pipeline
    opportunities.sort((a: any, b: any) => (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99));

    // Also get Won in 2026 for team performance
    const wonFilter = {
      and: [
        { property: "Estado Oportunidad", select: { equals: "Won" } },
        { property: "WON DATE", date: { on_or_after: "2026-01-01" } }
      ]
    };

    const wonPages = await notionQueryAll(DB_IDS.FUNNEL, wonFilter);
    const won2026 = wonPages.map(page => {
      const cerrador = getProp(page, "Cerrador de Oportunidad") || [];
      return {
        nombre: getProp(page, "Nombre Oportunidad") || "Sin nombre",
        total: getProp(page, "$ Total Estimado (Sin IVA)") || 0,
        cerrador: cerrador.length > 0 ? cerrador[0] : "Sin asignar",
        fecha: getProp(page, "WON DATE") || "",
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
