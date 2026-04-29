---
name: notion-dashboard-builder
description: >
  Complete guide for building dashboards that read live data from Notion databases
  via API. Covers querying Notion's REST API, handling pagination, resolving every
  property type (people, formulas, relations, rollups, selects), deploying serverless
  API functions (Netlify/Vercel), and building React frontends with Recharts.
  Encapsulates hard-won lessons from production: pagination data loss, timeout
  strategies, people field resolution, formula field behavior, case-sensitivity
  traps, and field-name typos. Use this skill whenever building anything that reads
  from Notion — dashboards, reports, data pipelines, integrations, serverless APIs,
  or any project that queries Notion databases programmatically. Also trigger when
  the user mentions "Notion API", "Notion database", "Notion integration", or wants
  to display Notion data in any format.
---

# Notion Dashboard Builder

This skill contains everything you need to build a dashboard (or any data consumer) that reads live data from Notion databases. It was built from hard production experience — every section addresses a real problem that caused hours of debugging.

**Before writing any Notion query code**, read `references/notion-api-guide.md`. It will save you from the most common and painful mistakes.

## When to use this skill

- Building a dashboard that displays Notion data
- Creating serverless API functions that query Notion
- Any project that reads from Notion databases programmatically
- Debugging why Notion API queries return wrong or incomplete data
- Migrating data out of Notion
- Building reports from Notion data

## Architecture pattern

The proven architecture for a Notion-backed dashboard:

```
[Notion DBs] → [Serverless Functions (API layer)] → [React Frontend]
```

The API layer is essential — never query Notion directly from the browser (API key exposure). Serverless functions (Netlify Functions, Vercel Edge, AWS Lambda) are the right middle layer.

### Tech stack that works

- **Frontend**: React 18 + Vite 5 + Recharts (charts) + inline styles or Tailwind
- **API layer**: Netlify Functions v2 (TypeScript `.mts`) or Vercel Edge Functions
- **Data**: Notion API v2022-06-28

### Project structure

```
project/
├── src/                          # React frontend
│   ├── data/
│   │   ├── DataProvider.jsx      # Fetches all APIs, provides context
│   │   ├── constants.js          # Colors, stage configs
│   │   └── fallback-data.js      # Hardcoded fallback if API fails
│   ├── tabs/                     # One component per dashboard tab
│   ├── components/ui/            # Reusable UI (KPICard, Tooltip, etc.)
│   └── utils/formatters.js       # Number/date formatting
├── netlify/functions/            # Serverless API endpoints
│   ├── notion-helpers.mjs        # Shared: DB IDs, getProp, queryAll
│   ├── api-revenue.mts           # Example: revenue endpoint
│   └── api-accounts.mts          # Example: accounts endpoint
└── index.html
```

## Step-by-step workflow

### 1. Discover the database schema

Before writing any query, use the Notion "Retrieve a database" endpoint to get the schema. This is a GET request (instant, no records fetched) that tells you every property name and type:

```javascript
const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}`, {
  headers: {
    "Authorization": `Bearer ${NOTION_API_KEY}`,
    "Notion-Version": "2022-06-28",
  },
});
const schema = await res.json();
// schema.properties = { "Field Name": { type: "select", select: { options: [...] } }, ... }
```

**Why this matters**: Field names in Notion can have typos, invisible characters, or unexpected casing. The schema endpoint gives you the exact string to use. We once spent hours debugging because a field was called `"Orginador del Lead"` (missing 'i') instead of `"Originador del Lead"`.

Build a debug endpoint in your API that returns the schema — you'll need it repeatedly:

```javascript
if (url.searchParams.get("debug") === "1") {
  // Return schema only — instant, no records
  return jsonResponse({ schema: parsedSchema });
}
```

### 2. Build the shared helpers

Create a `notion-helpers` module with these essentials. See `references/notion-api-guide.md` for the complete `getProp` function covering every property type.

Key helpers needed:
- `getProp(page, fieldName)` — extracts a typed value from any Notion property
- `queryAll(dbId, filter, deadlineMs)` — paginated query with timeout
- `jsonResponse(data)` / `errorResponse(msg)` — consistent API responses
- `DB_IDS` — centralized database ID constants

### 3. Query with the right strategy

**Read `references/notion-api-guide.md` section "Pagination and Timeout Strategy"** — this is the most critical section. The short version:

- Notion returns max 100 records per page
- If your query matches >100 records, you MUST paginate or you lose data silently
- Serverless functions have tight timeouts (Netlify free = ~10s)
- **Solution**: Split queries into small, parallel chunks (e.g., per-month) that each fit in one page

### 4. Build the frontend

- Use a `DataProvider` context that fetches all API endpoints in parallel
- Include hardcoded fallback data so the UI works even if the API is down
- Add a data status bar showing "Live from Notion" vs "Fallback data"
- Make it responsive from the start (CSS media queries at 900px and 600px breakpoints)

### 5. Deploy

For Netlify:
- Functions go in `netlify/functions/` with `.mts` extension
- Use `export const config: Config = { path: "/api/your-endpoint" }` for routing
- Set `NOTION_API_KEY` in Netlify environment variables
- Free plan timeout is ~10 seconds — design your queries accordingly

## Common traps (read this!)

These are real problems that each cost hours to debug. They're also covered in detail in the reference file.

1. **Silent data loss from pagination**: A query returning 120 records only gives you the first 100 if you don't paginate. No error, no warning. Your numbers are just wrong.

2. **People fields**: NEVER build a hardcoded map of user IDs to names. The Notion API returns `person.name` directly. Hardcoded maps go stale and produce wrong data.

3. **Formula fields**: These return their computed value in a nested `formula.type` → `formula.[type]` structure. They can be number, string, boolean, or date.

4. **Case sensitivity in select values**: Notion might store `"One shot"` but you compare against `"One Shot"`. Always use case-insensitive comparison.

5. **Field name typos**: Notion field names are set by humans and may contain typos. Always verify with the schema endpoint.

6. **Lifetime value vs monthly value**: If a database has both "Total Contract Value" and "Monthly Revenue" fields, make sure you're summing the right one. Using lifetime value when you need monthly will overcount by 10-20x.

7. **Timeout on combined queries**: Querying "all months of 2026" in one filter might return 800+ records needing 8 pages of pagination, timing out your serverless function. Query each month separately in parallel.

## Reference files

- `references/notion-api-guide.md` — **Read this first**. Complete Notion API guide: property types, getProp implementation, pagination strategy, filter syntax, timeout patterns, and every trap with code examples.
