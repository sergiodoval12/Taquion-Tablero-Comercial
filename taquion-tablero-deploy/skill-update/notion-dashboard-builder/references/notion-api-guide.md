# Notion API — Complete Guide

This is the definitive reference for querying Notion databases via API. Every section addresses a real production problem.

## Table of Contents

1. [Authentication and Setup](#authentication-and-setup)
2. [Property Types and getProp](#property-types-and-getprop)
3. [Pagination and Timeout Strategy](#pagination-and-timeout-strategy)
4. [Filter Syntax](#filter-syntax)
5. [Common Field Traps](#common-field-traps)
6. [People Fields — The Right Way](#people-fields)
7. [Formula Fields](#formula-fields)
8. [Serverless Function Patterns](#serverless-function-patterns)
9. [Debug Endpoints](#debug-endpoints)
10. [Frontend Data Patterns](#frontend-data-patterns)

---

## Authentication and Setup

```javascript
const NOTION_VERSION = "2022-06-28";
const NOTION_API_KEY = process.env.NOTION_API_KEY; // Never hardcode

async function queryNotion(dbId, filter, cursor) {
  const body = { page_size: 100 };
  if (filter) body.filter = filter;
  if (cursor) body.start_cursor = cursor;

  const res = await fetch(
    `https://api.notion.com/v1/databases/${dbId}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
  return res.json();
}
```

To discover a database schema (field names, types, select options) without fetching any records:

```javascript
// GET request — instant, returns only metadata
const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  headers: {
    "Authorization": `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
  },
});
const db = await res.json();
// db.properties = { "Field Name": { type: "select", select: { options: [...] } }, ... }
```

---

## Property Types and getProp

Notion properties have a consistent structure: `property.type` tells you the type, and the value lives under `property[type]`. Here's a complete extraction function:

```javascript
function getProp(page, name) {
  const prop = page.properties?.[name];
  if (!prop) return null;

  switch (prop.type) {
    case "title":
      return prop.title?.map(t => t.plain_text).join("") || "";

    case "rich_text":
      return prop.rich_text?.map(t => t.plain_text).join("") || "";

    case "number":
      return prop.number;  // number or null

    case "select":
      return prop.select?.name || null;  // string or null

    case "multi_select":
      return prop.multi_select?.map(s => s.name) || [];  // string[]

    case "checkbox":
      return prop.checkbox;  // boolean

    case "date":
      return prop.date?.start || null;  // "2026-01-15" or null

    case "people":
      // ALWAYS use p.name — never build a hardcoded ID→name map
      return prop.people?.map(p => p.name || p.id) || [];

    case "relation":
      return prop.relation?.map(r => r.id) || [];  // page ID[]

    case "rollup":
      // Rollups have a nested type
      const rollup = prop.rollup;
      if (rollup?.type === "number") return rollup.number;
      if (rollup?.type === "array") return rollup.array;
      return rollup;

    case "formula":
      // Formulas return computed values with their own type
      const f = prop.formula;
      if (f?.type === "number") return f.number;
      if (f?.type === "string") return f.string;
      if (f?.type === "boolean") return f.boolean;
      if (f?.type === "date") return f.date?.start || null;
      return null;

    case "url":
      return prop.url;

    case "email":
      return prop.email;

    case "phone_number":
      return prop.phone_number;

    case "created_time":
      return prop.created_time;

    case "last_edited_time":
      return prop.last_edited_time;

    case "status":
      return prop.status?.name || null;

    default:
      return null;
  }
}
```

### Getting ALL properties (for debugging)

When you need to see what a page actually contains:

```javascript
function getAllProps(page) {
  const result = {};
  for (const [name, prop] of Object.entries(page.properties || {})) {
    result[name] = { type: prop.type, value: getProp(page, name) };
  }
  return result;
}
```

---

## Pagination and Timeout Strategy

This is the most important section. Getting pagination wrong means silently losing data.

### The problem

Notion returns a maximum of **100 records per page**. If your query matches more than 100 records, the response includes `has_more: true` and a `next_cursor`. If you don't follow the cursor, you only get the first 100 records — and there is no error or warning.

### Basic pagination

```javascript
async function queryAll(dbId, filter) {
  let all = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const data = await queryNotion(dbId, filter, cursor);
    all = all.concat(data.results || []);
    hasMore = data.has_more === true;
    cursor = data.next_cursor;
  }
  return all;
}
```

### The serverless timeout problem

Serverless functions have hard timeouts:
- **Netlify free plan**: ~10 seconds
- **Netlify paid**: 26 seconds
- **Vercel hobby**: 10 seconds
- **Vercel pro**: 60 seconds

If your query needs 5 pages of pagination (500 records), each page taking ~2 seconds, that's 10 seconds — right at the limit. Combined queries that match many records will timeout and return partial data.

### The solution: per-dimension parallel queries

Instead of one big query, split into small queries that each fit in one page (~100 records):

```javascript
// BAD: One query for all 2026 data (~800 records = 8 pages = timeout)
const allData = await queryAll(dbId, { property: "Year", select: { equals: "2026" } });

// GOOD: 12 parallel queries, each ~80 records = 1 page each, ~3 seconds total
const MONTHS = ["1. Enero", "2. Febrero", /* ... */ "12. Diciembre"];

const results = await Promise.all(
  MONTHS.map(month =>
    queryAll(dbId, {
      and: [
        { property: "Year", select: { equals: "2026" } },
        { property: "Month", select: { equals: month } },
      ],
    }).catch(() => [])  // Don't let one month kill all months
  )
);

const allData = results.flat();
```

### Pagination with a hard deadline

For extra safety, add a deadline to stop paginating before the function times out:

```javascript
async function queryAllWithDeadline(dbId, filter, deadlineMs) {
  const deadline = Date.now() + deadlineMs;
  let all = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore && Date.now() < deadline) {
    try {
      const data = await queryNotion(dbId, filter, cursor);
      all = all.concat(data.results || []);
      hasMore = data.has_more === true;
      cursor = data.next_cursor;
    } catch {
      break;  // Return what we have rather than crash
    }
  }
  return all;
}
```

### How to know if you need to worry

Add a record count to your API response:

```javascript
return jsonResponse({
  data: processedData,
  records: { total: allRecords.length },
  updatedAt: new Date().toISOString(),
});
```

If you see `records.total` suspiciously close to 100 (or exactly 100), you're probably losing data to pagination.

---

## Filter Syntax

Notion filters use a nested object structure. The key concepts:

### Single property filter

```javascript
{ property: "Status", select: { equals: "Active" } }
{ property: "Amount", number: { greater_than: 1000 } }
{ property: "Created", date: { on_or_after: "2026-01-01" } }
{ property: "Name", rich_text: { contains: "Taquion" } }
{ property: "Archived", checkbox: { equals: false } }
```

### Combining filters

```javascript
// AND — all conditions must match
{
  and: [
    { property: "Year", select: { equals: "2026" } },
    { property: "Type", select: { equals: "Real" } },
    { property: "Month", select: { equals: "1. Enero" } },
  ]
}

// OR — any condition matches
{
  or: [
    { property: "Stage", select: { equals: "Won" } },
    { property: "Stage", select: { equals: "Forecast" } },
  ]
}
```

### Filter by relation (has a linked page)

```javascript
{ property: "Company", relation: { is_not_empty: true } }
```

### Filter gotcha: formula fields

You CANNOT filter by formula fields in the API. Formulas are computed server-side but not filterable. If you need to filter by a formula's value, you must fetch all records and filter client-side, or find an alternative non-formula field to filter on.

---

## Common Field Traps

### Trap 1: Field names have typos

Notion field names are set by humans. We encountered `"Orginador del Lead"` (missing the 'i' in "Originador"). The query silently returns null for a misspelled property name — no error.

**Fix**: Always discover the schema first with the GET database endpoint. Copy field names exactly from the schema.

### Trap 2: Select values are case-sensitive

Notion stores the exact string the user typed. `"One shot"` ≠ `"One Shot"`. Queries with the wrong case return zero results — no error.

**Fix**: Use the schema endpoint to see exact option values. In frontend comparisons, always use `.toLowerCase()`:

```javascript
// BAD
const oneShots = accounts.filter(a => a.tipo === "One Shot");

// GOOD
const oneShots = accounts.filter(a => a.tipo?.toLowerCase() === "one shot");
```

### Trap 3: Fields that don't exist on this database

A field might exist on Database A but not Database B, even if the databases are related. Querying a non-existent field returns null — no error.

**Example**: "Cerrador" and "Originador" existed on the Funnel DB but not on the Clients DB. The API happily returned null for every record, showing "Sin asignar" for every account.

**Fix**: Schema endpoint first. Always.

### Trap 4: Lifetime value vs. monthly value

If a database has `"$ Total Estimado"` (lifetime contract value) and monthly fields like `"Enero"`, `"Febrero"`, make sure you sum the right one. We once showed $740M in revenue per person when the company total was $533M — because we used lifetime value instead of monthly.

### Trap 5: Probability-weighted vs. raw amounts

Some databases have two amount fields:
- `"Monto Mensual"` = raw amount regardless of deal status
- `"Monto Mensual Ajustado"` = weighted by probability (Won=100%, Forecast=75%, Upside=40%)

Know which one you need. "Projected revenue" uses the weighted field. "Confirmed revenue" filters for Won status and uses the raw field.

---

## People Fields

### The right way

```javascript
case "people":
  return prop.people?.map(p => p.name || p.id) || [];
```

The Notion API returns the person's display name in `p.name`. That's it. Use it.

### The wrong way (NEVER do this)

```javascript
// NEVER DO THIS — IDs change, mappings go stale, names are wrong
const USER_MAP = {
  "26ad872b-xxxx": "Victoria Lupo",    // WRONG — this is actually Julian Cordoba
  "2dcd872b-xxxx": "Solana Cuevas",    // WRONG — this is actually Martín Villanueva
};
```

We built a USER_MAP based on partial data. It showed wrong Account Managers for every account. The fix was deleting the entire map and using `p.name`.

### Edge case: email instead of name

Some people fields show an email address instead of a name (e.g., `pablo.juanes@taquion.com.ar`). This means the person is not a full member of the Notion workspace — they were mentioned by email. Handle gracefully:

```javascript
const name = p.name || p.person?.email || p.id;
```

---

## Formula Fields

Formula fields in Notion are computed server-side. They return their result type, not "formula":

```json
{
  "type": "formula",
  "formula": {
    "type": "number",
    "number": 150000
  }
}
```

Key facts:
- Formula values CAN be read via the API (they're in query results)
- Formula values CANNOT be used in filters (you can't filter by a formula's value)
- Formula types can be: `number`, `string`, `boolean`, `date`
- A formula that references a deleted field returns null

The `getProp` function handles this:

```javascript
case "formula":
  const f = prop.formula;
  if (f?.type === "number") return f.number;
  if (f?.type === "string") return f.string;
  if (f?.type === "boolean") return f.boolean;
  if (f?.type === "date") return f.date?.start || null;
  return null;
```

---

## Serverless Function Patterns

### Netlify Functions v2 (TypeScript)

```typescript
import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  try {
    const apiKey = Netlify.env.get("NOTION_API_KEY");
    // ... query Notion ...
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/your-endpoint",
};
```

### Timeout-safe pattern with AbortController

```typescript
async function queryNotion(dbId, filter, cursor) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8s hard limit

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: { /* ... */ },
      body: JSON.stringify({ page_size: 100, filter, start_cursor: cursor }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
```

### Response helpers

```javascript
function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function errorResponse(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
```

---

## Debug Endpoints

Always build debug endpoints into your API functions. They save enormous time when data doesn't match expectations.

```typescript
// Debug 1: Schema only (instant, no records)
if (url.searchParams.get("debug") === "1") {
  const schema = await getDbSchema(DB_ID);
  return jsonResponse({ schema });
}

// Debug 2: Sample records with ALL properties (to inspect raw data)
if (url.searchParams.get("debug") === "2") {
  const data = await queryNotion(DB_ID, undefined);
  const samples = data.results.slice(0, 3).map(p => getAllProps(p));
  return jsonResponse({ samples, total: data.results.length });
}

// Debug 3: Specific subset with full detail (for investigating discrepancies)
if (url.searchParams.get("debug") === "3") {
  const filtered = await queryAll(DB_ID, specificFilter);
  const details = filtered.map(p => ({
    name: getProp(p, "Name"),
    amount: getProp(p, "Amount"),
    status: getProp(p, "Status"),
    // ... all fields you're investigating
  }));
  return jsonResponse({ total: filtered.length, details });
}
```

**Debug levels**:
- `?debug=1` → schema only (always keep this)
- `?debug=2` → 3 raw sample records (for verifying field extraction)
- `?debug=3` → filtered subset with detail (for investigating specific data issues)

---

## Frontend Data Patterns

### DataProvider with fallback

```jsx
const DataContext = createContext({});

export default function DataProvider({ children }) {
  const [data, setData] = useState({ revenue: FALLBACK_REVENUE, opportunities: FALLBACK_OPPS });
  const [source, setSource] = useState("loading");

  useEffect(() => {
    Promise.all([
      safeFetch("/api/revenue"),
      safeFetch("/api/opportunities"),
      safeFetch("/api/accounts"),
    ]).then(([rev, opps, accts]) => {
      setData({
        revenue: rev?.revenue || FALLBACK_REVENUE,
        opportunities: opps?.opportunities || FALLBACK_OPPS,
        accounts: accts?.accounts || FALLBACK_ACCOUNTS,
      });
      setSource(rev && opps && accts ? "api" : "partial");
    }).catch(() => setSource("fallback"));
  }, []);

  return <DataContext.Provider value={{ ...data, source }}>{children}</DataContext.Provider>;
}

async function safeFetch(url, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}
```

### Data status bar

Always show the user whether they're seeing live or fallback data:

```jsx
<div className="status-bar">
  <span className={source === "api" ? "dot-green" : "dot-orange"} />
  {source === "api" ? "Datos en vivo desde Notion" : "Datos de respaldo"}
</div>
```

### Number formatting (ARS / large numbers)

```javascript
export function fmtM(n) {
  if (n == null || isNaN(n)) return "$0";
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(0) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}
```

### Responsive design

Add CSS media queries from the start. Key breakpoints:
- **≤ 900px** (tablet): KPI grids 4→2 cols, 2-col layouts → 1 col, reduce padding
- **≤ 600px** (phone): KPI grids → 1 col, hide secondary header info, smaller text in tables

Use CSS classes for grid layouts so media queries can override them. Inline styles can't be overridden by media queries without `!important`.

### Rich tooltips

When charts aggregate data (e.g., revenue by industry), pass the underlying items as `_details` in the chart data so tooltips can show the breakdown:

```javascript
const industryData = Object.entries(industryMap).map(([name, d]) => ({
  name,
  value: d.value,
  _details: d.deals.sort((a, b) => b.total - a.total).slice(0, 6),
  _moreCount: Math.max(0, d.deals.length - 6),
}));

// In the chart:
<Tooltip content={<DetailTooltip />} />
```
