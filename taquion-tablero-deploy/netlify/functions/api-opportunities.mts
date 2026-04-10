import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, getPropAny, getAllProps, jsonResponse, errorResponse } from "./notion-helpers.mjs";

const NOTION_VERSION = "2022-06-28";

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
    const url = new URL(req.url);

    // Debug 1: Return Funnel database schema (instant, no records)
    if (url.searchParams.get("debug") === "1") {
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.FUNNEL}`, {
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

    // Debug 2: Return first 3 Won deals with ALL properties (to verify people fields)
    if (url.searchParams.get("debug") === "2") {
      const wonFilter = {
        and: [
          { property: "Estado Oportunidad", select: { equals: "Won" } },
          { property: "WON DATE", date: { on_or_after: "2026-01-01" } }
        ]
      };
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const res = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.FUNNEL}/query`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filter: wonFilter, page_size: 3 }),
      });
      const data = await res.json();
      const samples = (data.results || []).map((p: any) => getAllProps(p));
      return jsonResponse({ samples, total: data.results?.length });
    }

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
        cerrador: extractPerson(page, "Cerrador de Oportunidad"),
        originador: extractPerson(page, "Orginador del Lead"),
        bo: extractPerson(page, "Business Owner"),
        duracion: getProp(page, "Duración") || "",
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
      const fecha = wonDate ? wonDate.slice(0, 7) : "";

      // Monthly revenue from formula fields (matches Forecast DB monthly amounts)
      const ene = getProp(page, "Enero") || 0;
      const feb = getProp(page, "Febrero") || 0;
      const mar = getProp(page, "Marzo") || 0;
      const abr = getProp(page, "Abril") || 0;
      const q1 = ene + feb + mar;
      const ytd = q1 + abr;

      return {
        nombre: getProp(page, "Nombre Oportunidad") || "Sin nombre",
        total: getProp(page, "$ Total Estimado (Sin IVA)") || 0,
        q1,
        ytd,
        cerrador: extractPerson(page, "Cerrador de Oportunidad"),
        originador: extractPerson(page, "Orginador del Lead"),
        bo: extractPerson(page, "Business Owner"),
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
