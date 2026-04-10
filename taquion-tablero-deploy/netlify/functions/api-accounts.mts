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
    // Query without filter first — "Antiguo?" may not exist in this database
    let pages: any[];
    try {
      pages = await notionQueryAll(DB_IDS.CLIENTES, {
        property: "Antiguo?",
        checkbox: { equals: false }
      });
    } catch (filterErr: any) {
      // If the filter property doesn't exist, query without filter
      console.warn("Filter 'Antiguo?' failed, querying without filter:", filterErr.message);
      pages = await notionQueryAll(DB_IDS.CLIENTES, undefined);
    }

    // Return schema of first page for debugging (only if ?debug=1)
    const url = new URL(req.url);
    if (url.searchParams.get("debug") === "1" && pages.length > 0) {
      const schema = getAllProps(pages[0]);
      return jsonResponse({ schema, totalPages: pages.length });
    }

    const accounts = pages.map((page: any) => {
      // Try multiple property name variants for each field
      const industria = extractStringOrArray(page, "Industria", "Industrias", "Sector", "Vertical");
      const am = extractPerson(page, "AM", "Account Manager", "Responsable");
      const udnRaw = getPropAny(page, "Unidad de Ejecución", "UDN", "Línea de Negocio", "Linea de Negocio", "Producto") || [];

      return {
        nombre: getProp(page, "Nombre") || getProp(page, "Name") || "Sin nombre",
        industria,
        am,
        tipo: getPropAny(page, "Tipo", "Tipo de Cuenta", "Tipo Cliente", "Tipo de Organización") || "Sin clasificar",
        ticketMes: getPropAny(page, "Ticket Mensual", "Monto Mensual", "Ticket/Mes", "Ticket", "Fee Mensual") || 0,
        udn: Array.isArray(udnRaw) ? udnRaw : (udnRaw ? [udnRaw] : []),
        cerrador: extractPerson(page, "Cerrador", "Cerrador de Oportunidad"),
        originador: extractPerson(page, "Originador", "Originador de Oportunidad", "Generador"),
        fee: getPropAny(page, "Fee", "Fee %", "Comision", "Comisión") || 0,
      };
    }).filter((a: any) => a.nombre && !a.nombre.includes("ANTIGUO"));

    return jsonResponse({ accounts, updatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("api-accounts error:", err);
    return errorResponse(err.message);
  }
};

export const config: Config = {
  path: "/api/accounts"
};
