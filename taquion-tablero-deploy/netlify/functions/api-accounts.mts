import type { Context, Config } from "@netlify/functions";
import { DB_IDS, USER_MAP, notionQueryAll, getProp, jsonResponse, errorResponse } from "./notion-helpers.mjs";

export default async (req: Request, context: Context) => {
  try {
    // Query active accounts (Antiguo = false)
    const filter = {
      property: "Antiguo?",
      checkbox: { equals: false }
    };

    const pages = await notionQueryAll(DB_IDS.CLIENTES, filter);

    const accounts = pages.map(page => {
      const industrias = getProp(page, "Industria") || [];
      const amPeople = getProp(page, "AM") || [];

      return {
        nombre: getProp(page, "Nombre") || "Sin nombre",
        industria: industrias.length > 0 ? industrias[0] : "Sin clasificar",
        am: amPeople.length > 0 ? amPeople[0] : "Sin asignar",
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
