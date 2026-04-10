// Shared Notion API helpers
const NOTION_VERSION = "2022-06-28";

export const DB_IDS = {
  FORECAST: "e316de3f5d67463fb6972bebe213610e",
  FUNNEL: "3c563648cf8b477ab4a89db37db894d6",
  CLIENTES: "35ec49b7371e476fa9a2bf5db46bff82",
};

// No USER_MAP needed — Notion API returns correct names in p.name directly

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
      return prop.people?.map(p => p.name || p.id) || [];
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

// Try multiple property name variants, return first non-null result
export function getPropAny(page, ...names) {
  for (const name of names) {
    const val = getProp(page, name);
    if (val !== null && val !== undefined) return val;
  }
  return null;
}

// Extract ALL properties from a page as a flat object (for debugging/schema discovery)
export function getAllProps(page) {
  const result = {};
  for (const [name, prop] of Object.entries(page.properties)) {
    result[name] = { type: prop.type, value: getProp(page, name) };
  }
  return result;
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
