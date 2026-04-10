import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, getPropAny, getAllProps, jsonResponse, errorResponse } from "./notion-helpers.mjs";

function extractPerson(page: any, ...propNames: string[]): string {
  for (const name of propNames) {
    const val = getProp(page, name);
    if (Array.isArray(val) && val.length > 0) return val[0];
    if (typeof val === "string" && val) return val;
  }
  return "Sin asignar";
}

function extractStringOrArray(page: any, ...propNames: string[]): string {
  for (const name of propNames) {
    const val = getProp(page, name);
    if (Array.isArray(val) && val.length > 0) return val[0];
    if (typeof val === "string" && val) return val;
  }
  return "Sin clasificar";
}

// Extract rollup value that may be nested in array of objects
function extractRollupFirst(page: any, propName: string): string | null {
  const prop = page.properties?.[propName];
  if (!prop || prop.type !== "rollup") return null;
  const arr = prop.rollup?.array;
  if (Array.isArray(arr) && arr.length > 0) {
    const first = arr[0];
    if (first.type === "select" && first.select?.name) return first.select.name;
    if (first.type === "rich_text") return first.rich_text?.map((t: any) => t.plain_text).join("") || null;
    if (first.type === "number") return first.number;
  }
  return null;
}

const NOTION_VERSION = "2022-06-28";

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);

    // Debug 0: return Clientes database schema (instant, no records)
    if (url.searchParams.get("debug") === "0") {
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const dbRes = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.CLIENTES}`, {
        headers: { "Authorization": `Bearer ${apiKey}`, "Notion-Version": NOTION_VERSION },
      });
      const dbMeta = await dbRes.json();
      const schema: Record<string, any> = {};
      if (dbMeta.properties) {
        for (const [name, prop] of Object.entries(dbMeta.properties) as any) {
          schema[name] = { type: prop.type };
          if (prop.type === "select" && prop.select?.options)
            schema[name].options = prop.select.options.map((o: any) => o.name);
          if (prop.type === "rollup") {
            schema[name].function = prop.rollup?.function;
            schema[name].relation = prop.rollup?.relation_property_name;
            schema[name].rollup_property = prop.rollup?.rollup_property_name;
          }
        }
      }
      return jsonResponse({ schema, title: dbMeta.title?.map((t: any) => t.plain_text).join("") });
    }

    // Debug 2: return raw AM data for active accounts (to diagnose name mismatch)
    if (url.searchParams.get("debug") === "2") {
      const apiKey = Netlify.env.get("NOTION_API_KEY");
      const body: any = {
        page_size: 100,
        filter: { property: "Antiguo?", checkbox: { equals: false } },
      };
      const res = await fetch(`https://api.notion.com/v1/databases/${DB_IDS.CLIENTES}/query`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Notion-Version": NOTION_VERSION, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const debug = (data.results || [])
        .filter((p: any) => {
          // Only active accounts
          const activa = p.properties?.["Esta activa?"];
          return activa?.formula?.boolean === true;
        })
        .slice(0, 10)
        .map((p: any) => ({
          nombre: p.properties?.["Nombre"]?.title?.map((t: any) => t.plain_text).join("") || "?",
          am_raw: p.properties?.["AM"],
        }));
      return jsonResponse({ debug, total: data.results?.length });
    }

    // Filter: Antiguo? = false (server-side Notion filter)
    let pages: any[];
    try {
      pages = await notionQueryAll(DB_IDS.CLIENTES, {
        property: "Antiguo?",
        checkbox: { equals: false }
      });
    } catch (filterErr: any) {
      console.warn("Filter 'Antiguo?' failed:", filterErr.message);
      pages = await notionQueryAll(DB_IDS.CLIENTES, undefined);
    }

    // Debug: return schema of first page
    if (url.searchParams.get("debug") === "1" && pages.length > 0) {
      const schema = getAllProps(pages[0]);
      return jsonResponse({ schema, totalPages: pages.length });
    }

    const accounts = pages
      // Client-side filter: only active accounts (Esta activa? formula = true)
      .filter((page: any) => {
        const activa = getProp(page, "Esta activa?");
        return activa === true;
      })
      .map((page: any) => {
        const industria = extractStringOrArray(page, "Industria", "Industrias");
        const am = extractPerson(page, "AM");

        // Sector: "Unidad de Ejecución" select (PRIVADO / PÚBLICO)
        const sector = getProp(page, "Unidad de Ejecución") || "Sin clasificar";

        // Tipo: from Temporalidad rollup (Recurrente / One shot / Campaña por tiempo limitado)
        const tipo = extractRollupFirst(page, "Temporalidad") || "Sin clasificar";

        // Solución vendida: rollup of multi_select from related opportunities
        const solVendida = extractRollupFirst(page, "Solución vendida") || "";

        return {
          nombre: getProp(page, "Nombre") || "Sin nombre",
          industria,
          am,
          tipo,
          sector,
          solVendida,
          proyectosActivos: getProp(page, "Proyectos Activos") || "",
        };
      });

    return jsonResponse({ accounts, total: accounts.length, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("api-accounts error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/accounts"
};
