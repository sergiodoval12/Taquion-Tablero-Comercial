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

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);

    // Filter: Antiguo? = false (server-side Notion filter)
    let pages: any[];
    try {
      pages = await notionQueryAll(DB_IDS.CLIENTES, {
        property: "Antiguo?",
        checkbox: { equals: false }
      });
    } catch (filterErr: any) {
      console.warn("Filter 'Antiguo?' failed, querying without filter:", filterErr.message);
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
        const industria = extractStringOrArray(page, "Industria", "Industrias", "Sector", "Vertical");
        const am = extractPerson(page, "AM", "Account Manager", "Responsable");
        const udnRaw = getPropAny(page, "Unidad de Ejecución", "UDN", "Línea de Negocio") || [];

        return {
          nombre: getProp(page, "Nombre") || getProp(page, "Name") || "Sin nombre",
          industria,
          am,
          udn: typeof udnRaw === "string" ? udnRaw : (Array.isArray(udnRaw) ? udnRaw.join(", ") : ""),
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
