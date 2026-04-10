import type { Context, Config } from "@netlify/functions";
import { DB_IDS, notionQueryAll, getProp, getPropAny, jsonResponse, errorResponse } from "./notion-helpers.mjs";

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
    const filter = {
      property: "Antiguo?",
      checkbox: { equals: false }
    };

    const pages = await notionQueryAll(DB_IDS.CLIENTES, filter);

    const accounts = pages.map((page: any) => {
      const industrias = getProp(page, "Industria") || [];
      const amPeople = getProp(page, "AM") || [];
      const udnRaw = getPropAny(page, "UDN", "Línea de Negocio", "Linea de Negocio", "Producto") || [];

      return {
        nombre: getProp(page, "Nombre") || "Sin nombre",
        industria: industrias.length > 0 ? industrias[0] : "Sin clasificar",
        am: amPeople.length > 0 ? amPeople[0] : "Sin asignar",
        tipo: getPropAny(page, "Tipo", "Tipo de Cuenta", "Tipo Cliente") || "Sin clasificar",
        ticketMes: getPropAny(page, "Ticket Mensual", "Monto Mensual", "Ticket/Mes", "Ticket") || 0,
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
