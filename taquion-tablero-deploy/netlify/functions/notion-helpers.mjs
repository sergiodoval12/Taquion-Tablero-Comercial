// Shared Notion API helpers
const NOTION_VERSION = "2022-06-28";

export const DB_IDS = {
  FORECAST: "43f5c1d65c6e464f8aed27d4d5c4b9eb",
  FUNNEL: "905f0e56021d49769e1c8c73c2f1b4b3",
  CLIENTES: "002d0e9c565a4e79b9ddfc31229c2a57",
};

export const USER_MAP = {
  "4bff4d77-a3f3-4e30-9a56-92988bc67681": "Diego Kupferberg",
  "302d872b-594c-8115-89f7-0002690a8a5e": "Diego Lajst",
  "68a319ea-bdde-4772-aa9e-63a7d3e44095": "Sergio Doval",
  "249d872b-594c-8171-a1b5-00020bea8c11": "Gisela Bongiorni",
  "3cf22a32-bb38-4f99-afad-ead8b70b2244": "Sol Rios",
  "26ad872b-594c-817b-87c6-0002dbfa020d": "Victoria Lupo",
  "2dcd872b-594c-815a-98d4-000245b71bd9": "Solana Cuevas",
  "203d872b-594c-81cc-b938-0002a91c5a62": "Matias Fermin",
  "209f5c27-99fd-46a4-9b1a-9469d066260d": "Azul",
  "8e17e61c-d47c-4e5e-8965-3e85fd45dea6": "Alejo",
};

export async function notionQuery(databaseId, filter, sorts, startCursor) {
  const apiKey = Netlify.env.get("NOTION_API_KEY");
  if (!apiKey) throw new Error("NOTION_API_KEY not configured");

  const body = {};
  if (filter) body.filter = filter;
  if (sorts) body.sorts = sorts;
  if (startCursor) body.start_cursor = startCursor;
  body.page_size = 100;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function notionQueryAll(databaseId, filter, sorts) {
  let allResults = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const data = await notionQuery(databaseId, filter, sorts, cursor);
    allResults = allResults.concat(data.results);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return allResults;
}

// Extract property value from Notion page
export function getProp(page, name) {
  const prop = page.properties[name];
  if (!prop) return null;

  switch (prop.type) {
    case "title":
      return prop.title?.map(t => t.plain_text).join("") || null;
    case "rich_text":
      return prop.rich_text?.map(t => t.plain_text).join("") || null;
    case "number":
      return prop.number;
    case "select":
      return prop.select?.name || null;
    case "multi_select":
      return prop.multi_select?.map(s => s.name) || [];
    case "status":
      return prop.status?.name || null;
    case "checkbox":
      return prop.checkbox;
    case "date":
      return prop.date?.start || null;
    case "people":
      return prop.people?.map(p => USER_MAP[p.id] || p.name || p.id) || [];
    case "relation":
      return prop.relation?.map(r => r.id) || [];
    case "formula":
      if (prop.formula.type === "number") return prop.formula.number;
      if (prop.formula.type === "string") return prop.formula.string;
      if (prop.formula.type === "boolean") return prop.formula.boolean;
      if (prop.formula.type === "date") return prop.formula.date?.start || null;
      return null;
    case "rollup":
      if (prop.rollup.type === "number") return prop.rollup.number;
      if (prop.rollup.type === "array") return prop.rollup.array;
      return null;
    case "url":
      return prop.url;
    case "email":
      return prop.email;
    case "created_time":
      return prop.created_time;
    case "last_edited_time":
      return prop.last_edited_time;
    default:
      return null;
  }
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
