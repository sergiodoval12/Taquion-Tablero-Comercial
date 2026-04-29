# Taquion — Company Context

## Who they are

**Grupo Taquion** is a strategic communications and community-building company based in Argentina. CEO: **Sergio Doval**. The company helps brands, governments, and organizations build influence and reach through data, narrative, and community strategy.

## Products

### 1. Strategic Planning (Strategic Landing)
Works like a marketing/communications agency with studio, creativity, data, and client acquisition capabilities. Key concept: **"Strategic Landing al revés"** — build the landing from the client's desired outcome backwards, rather than from the service offering forwards. Also: **"construir destino"** as the core value proposition.

### 2. Comunidad Plus
Creates influential communities for brands and organizations. A community is a space where people gather around shared interests, generating real value interaction.

**5 steps of the experience**: originar la conversación → distribuir clips → generar impacto y crecimiento → conversación en vivo por WhatsApp → encuentros exclusivos

**3 levels of membership**:
- Nivel inicial (low budget)
- Entry access (access to debates)
- Socio de activación / Socio de cocreación / Constructor del ecosistema

Operates across verticals: finanzas, energía, salud, cultura deportiva, consumo masivo, AAPP/sindicatos.

## Key people

| Person | Role |
|--------|------|
| Sergio Doval | CEO, Sponsor Ejecutivo del Modelo Comercial |
| Sol Rios Brinatti | COO — cadencia operativa, scorecard, cliente conocido/producto conocido |
| Diego Kupferberg | Gerente Comercial (cerrador) — cierra los deals; primer foco: cámaras empresariales y acompañamientos privados |
| Diego Lajst | COO / Business Owner |
| Ciro Garcia Resta | Business Owner |
| Matías Fermín | GC Phantom / Banca & Fintech — generador de deals en el vertical financiero |
| Gisela Bongiorni | Steward del Modelo Comercial — diseñó e implementa el sistema de incentivos MVP 2026 |
| Alejo Zubillaga | Salida (ex Director Creativo) |
| Tute | Creativo en negociación — reemplaza figura creativa de Alejo |
| Victoria Lupo | Insights (acompañamiento) |
| Solana Cuevas | Ignite / Growth ops (acompañamiento) |
| Azul | Reubicada → lógica comercial |

## Commercial model (MVP 2026)

**Pool**: 20% of pricing goes to commercial structure
- **Business Owner (BO)**: 2.5% of vertical revenue
- **Referral** (anyone who brings the opportunity): 7.5% — unlimited, no cap
- **Cerrador** (closer): capped commission
- If same person brings AND closes: 15%

**GC profile**: consultivo, cuota de $50M ARS. Onboarding: paid learning phase (500K/20hs o 1M/40hs) without leaving current job. Testing 3 candidates with $10K USD budget.

**Revenue split**: 60% from creativity team / 40% from commercial team (of $4,200M ARS annual target).

**Growth matrix (Ansoff)**: Sol = known client / known product; Sergio = new client / new product (strategic focus).

**Commercial team for dashboard (COMERCIALES array)**:

| Nombre | Target Mensual | Role | modelRole |
|--------|---------------|------|-----------|
| Sergio Doval | $50M | CEO | CEO |
| Diego Kupferberg | $50M | Gerente Comercial | GC |
| Sol Rios Brinatti | $50M | COO | BO |
| Diego Lajst | $50M | COO | BO |
| Ciro Garcia Resta | $50M | Business Owner | BO |

## Advisory Board

**Cadence**: 3rd Wednesday of each month, 10:00–12:00 hs (presencial / Google Meet)

**Members**: Pablo Juanes Roig, Fernando Bekes (fbekes@gmail.com), Ciro García Resta, Pablo Knopoff (pknopoff@isonomia.com.ar), Guillermo Natale (nataleguillermo@gmail.com), Diego Lajst, Pedro Swier, Gonzalo Pascual Merlo

**Meeting history**:
- AB #1: (inaugural)
- AB #2: (to be recovered)
- AB #3: 18/03/2026 — Scorecard, runway, nueva etapa, modelo comercial, Finance Index showcase
- AB #4: 15/04/2026 — Mañana de trabajo (½ día), revisar compromisos, financiero, comercial, ops, productos

**Role of Advisory Board**: consultivo — recomienda/valida + opción de régimen comercial. No decide operación (eso es el CEO).

## Financial situation (as of April 2026)

- **Revenue Q1 2026 (Won)**: ~$533M ARS (confirmed)
- **Proyectado Anual (ponderado)**: ~$2,293M ARS
  - Won: $1,718M (74.9%)
  - Forecast: $431M (18.8%)
  - Upside: $143M (6.2%)
- **Target Anual**: $4,200M ARS
- **Target por trimestre**: Q1 $650M | Q2 $850M | Q3 $1,200M | Q4 $1,500M
- **Proyectado Q2**: $672M (79% del target)
- **Proyectado Q3**: $575M (48% del target)
- **Active accounts**: ~22-23
- **Runway**: 3 months (objetivo: 9 meses)
- **Gap**: +$30M ARS/mes needed in new accounts
- **Investment ask**: USD 50K = $40K buffer de estabilidad + $10K fuerza comercial/GC/equipamiento
- **Negociating with**: "Joe" — structure: crédito standby preferido; no colaterales personales

---

## Notion Database IDs (API-ready)

| Database | ID | Purpose |
|----------|-----|---------|
| **CLIENTES** (Registro de Organizaciones) | `35ec49b7371e476fa9a2bf5db46bff82` | Active accounts, AM assignments, industria |
| **FUNNEL** (Funnel / Oportunidades) | `3c563648cf8b477ab4a89db37db894d6` | Pipeline, Won deals, commercial attribution |
| **FORECAST** (General 2026) | `e316de3f5d67463fb6972bebe213610e` | Monthly revenue (Real/Target), Monto Mensual Ajustado |

**Notion API key env var**: `NOTION_API_KEY`
**Notion API version**: `2022-06-28`

### CLIENTES DB — Field Reference

| Field | Type | Notes |
|-------|------|-------|
| Nombre | title | Account name |
| Industria | select | Industry classification |
| AM | people | Account Manager — returns correct names via `p.name` |
| Tipo | select | "Recurrente", "One shot" (lowercase 's'!) — usar case-insensitive match |
| Unidad de Ejecución | select | "PRIVADO" / "PÚBLICO" — NO es UDN (Inspire/Insights/Ignite) |
| Solución vendida | rich_text | Product sold |
| Proyectos Activos | number | Active project count |

**Fields that DO NOT exist in Clientes**: Ticket Mensual, Cerrador, Originador, Fee, UDN. These are on the Funnel DB only.

### FUNNEL DB — Field Reference

| Field | Type | Notes |
|-------|------|-------|
| Nombre Oportunidad | title | Deal name |
| Estado Oportunidad | select | Pipeline, Upside, Forecast, Commit, Won, Lost, Nurturing |
| $ Total Estimado (Sin IVA) | number | Deal LIFETIME value (NOT monthly!) |
| Industrias | multi_select | Industry tags |
| Cerrador de Oportunidad | people | Who closes the deal |
| **Orginador del Lead** | people | **⚠ TYPO IN NOTION** — "Orginador" sin la 'i' |
| Business Owner | people | BO assigned |
| Upselling | checkbox | Is upsell to existing client? |
| WON DATE | date | When deal was won |
| PIPELINE DATE / UPSIDE DATE | date | For velocity calculation |
| Duración | formula | Deal duration |
| Enero, Febrero, Marzo, Abril... | formula/number | Monthly revenue — USE THESE for per-month Won attribution |

**⚠ CRITICAL for per-person attribution**: Para calcular revenue Q1 por persona, sumar `Enero + Febrero + Marzo` de los Won deals. NUNCA usar `$ Total Estimado` que es el valor total del contrato y sobreestima enormemente (ej: $740M por persona vs $533M de toda la empresa).

### FORECAST DB — Field Reference

| Field | Type | Notes |
|-------|------|-------|
| FACTURACIÓN | title | Record name |
| Tipo | select | "Real" (deals) or "Target" (budget) |
| Año Facturación | select | "2025", "2026" |
| Mes Facturación | select | "1. Enero", "2. Febrero", ..., "12. Diciembre" |
| Monto Mensual | number | Raw monthly amount |
| **Monto Mensual Ajustado** | formula | Probability-weighted: Won=100%, Forecast=75%, Upside=40%, Lost/Nurturing=0% |
| Estado Oportunidad Fórmula | formula | "Won", "Forecast", "Upside", etc. |
| Moneda | select | "ARS" |
| Compañía | relation | Link to client |
| Industria Fórmula | formula | Industry from linked opportunity |

**Revenue calculation methodology**:
- **Revenue Real (Won only)**: `Tipo="Real"` + `Estado Oportunidad Fórmula="Won"` → sum `Monto Mensual`
- **Revenue Ponderado (Proyectado)**: `Tipo="Real"` → sum `Monto Mensual Ajustado` (ALL statuses)
- **Target**: `Tipo="Target"` → sum `Monto Mensual`

### People field resolution — NEVER use hardcoded USER_MAP

The Notion API returns correct names via `p.name` in people properties. Previous attempts to map person UUIDs to names had WRONG mappings:
- ID `26ad872b` was mapped to "Victoria Lupo" but is actually "Julian Cordoba Pivotto"
- ID `2dcd872b` was mapped to "Solana Cuevas" but is actually "Martín Villanueva"

Always use `p.name || p.id`. Some people show email addresses instead of names (e.g., `pablo.juanes@taquion.com.ar`) — means they're not full Notion workspace members.

---

## Commercial Dashboard

**Live URL**: https://comercial-tqn.netlify.app
**Login**: usuario `taquion`, clave `comercial2026` (credentials NOT shown on login page)
**GitHub repo**: `sergiodoval12/Taquion-Tablero-Comercial`
**Tech stack**: React 18 + Vite 5 + Recharts, Netlify Functions v2 (TypeScript .mts)

### Dashboard tabs
1. **Resumen** — Q1 Real, Revenue Anual Won, Pipeline Total, Cuentas Activas, monthly bar chart (Won vs Target vs 2025), funnel by stage, industry distribution with drill-down tooltips
2. **Seguimiento Comercial** — Per-person attribution (Originador, Cerrador, BO), Revenue Q1 per role
3. **Cuentas & Industrias** — Account list with AM, tipo, sector (PRIVADO/PÚBLICO), industry/sector charts
4. **Pipeline** — Funnel conversion, pipeline by industry (stacked), opportunity table with filters, drill-down tooltips
5. **Equipo** — Team performance cards, compensation model
6. **Revenue** — Quarterly cards with ponderado, cumulative annual chart (with explanation callout), monthly detail table
7. **Alertas** — Operational alerts

### API endpoints (Netlify Functions v2)
- `/api/revenue` — from FORECAST DB, returns `{real, projected, target, r2025, isFuture}` per month
- `/api/opportunities` — from FUNNEL DB, returns active pipeline + Won 2026 deals
- `/api/accounts` — from CLIENTES DB, returns active accounts

### Key technical lessons learned
- **Netlify free plan timeout**: ~10 seconds, NOT 60s. Use per-month parallel queries.
- **Pagination**: 100 records/page max. Combined multi-month queries lose data. Always query per-month in parallel.
- **Case sensitivity**: Notion returns "One shot" (lowercase 's'). Always use case-insensitive comparison.
- **Push from sandbox blocked**: Sergio pushes from his local machine after changes.
- **Responsive**: Site is mobile-responsive (breakpoints at 900px and 600px).
- **Tooltips**: Industry and funnel charts have drill-down tooltips showing composing opportunities.

## Notion data URLs (browser)

| Resource | URL |
|----------|-----|
| Home Cuentas | https://www.notion.so/a0a9e6652d2142dd97f32361712f3444 |
| En Marcha / Cuentas Activas | https://www.notion.so/174019abc46d45488c896a688d95cde1 |
| Clientes Activos DB | https://www.notion.so/2a04388ba7f5808e929dcea4791871c8 |
| General 2026 (Forecast) | https://www.notion.so/2814388ba7f581df85ddcb2d5fc72e99 |

## Minuta PDF style

Built with **reportlab** in Python. Key design elements:
- Colors: TAQUION_DARK `#1A1A2E`, TAQUION_ACCENT `#E94560` (coral-red), TAQUION_LIGHT `#F5F5F5`
- Custom flowables: `HeaderBanner` (full-width header), `SectionBox` (numbered section heading with accent stripe)
- Tables use `kp()` / `fp()` / `ap()` helper functions returning Paragraph objects for text wrapping
- Output always to `/sessions/.../mnt/outputs/`

See `scripts/create_minuta_template.py` for the full working template from AB #3.
