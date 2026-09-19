# Global Energy Decision Atlas

Global Energy Decision Atlas is a React decision-support application for comparing national electricity prices, generation mix, total energy consumption, and energy trade or balance exposure. It supports the original 15-country assignment data and a separate 50-country snapshot.

Visitors can continue as guests and use the complete atlas without creating an account. Guests can explore both datasets, change filters, and download results, but their customized views and activity history are not stored. Signed-in users receive the same analysis plus synchronized profile preferences and up to 25 private saved views. The Supabase service-role key is never exposed to the browser.

Public course files are available without sign-in at [global-energy-decision-atlas.vercel.app/deliverables](https://global-energy-decision-atlas.vercel.app/deliverables).

## What is included

- Guest access plus optional email and password registration, confirmation, sign-in, and password recovery through Supabase Auth
- Optional Google OAuth integration and database row-level security for account-owned records
- Assignment 15 and Expanded 50 data scopes
- Full country or regional scope with an eight-country focus list
- Four-region comparison with member and aggregate modes
- An offline SVG world map from the packaged `world-atlas` boundaries
- Price, non-fossil share, consumption, and trade or balance map metrics
- A filter rail that expands on hover, focus, or click, can be pinned on desktop, and becomes a touch drawer on smaller screens
- Dynamic selection insights for benchmarks, cost-and-mix tradeoffs, concentration or exposure, and data confidence
- Four fixed story views that apply reproducible country, focus, metric, and sort configurations without creating a saved view
- Active-dataset median reference lines and narrative explanations beneath the comparison charts
- Light, dark, and system themes
- English, Simplified Chinese, Spanish, Arabic, French, and Brazilian Portuguese, including RTL layout for Arabic
- Stable English CSV fields and ISO3 codes
- Up to 25 private saved views per account

## Data

The two scopes deliberately retain different trade definitions.

| Scope | Countries | Trade field | Browser delivery |
| --- | ---: | --- | --- |
| Assignment 15 | 15 | Reported total energy net imports from the supplied file | Validated guest snapshot or authenticated database query |
| Expanded 50 | 50 | Primary energy consumption minus total energy production | Validated guest snapshot or authenticated database query |

The original [Assignment 15 CSV](data/energy-data.csv) remains unchanged. Its SHA-256 is `c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa`.

The versioned [Expanded 50 CSV](data/expanded-energy-50-v1.csv) is generated from the public GlobalPetrolPrices comparison table, the OWID Energy CSV, and EIA International bulk data. Its [source manifest](data/expanded-energy-50-v1.sources.json) records the source URLs, access date, selected years, fallback policy, and checksum.

The manifest keeps raw data sources separate from `contextSources`. Context links from the IEA, Eurostat, World Bank, and EIA support cautious market interpretation but do not change the source data or its checksum. [Story presets](data/story-presets.json) contain the fixed analysis configurations used by the site, analysis summary, reflection, and presentation.

Run a manual refresh with:

```bash
npm run data:update
```

The update fails before writing output if a required source column or price table marker changes, if coverage falls below 90 percent, or if any validation rule fails. A country may fall back by no more than two years.

## Regional calculations

Regional residential and business prices use the unweighted median of reported members and show `n/N` coverage. Consumption and the trade or balance field are summed. Electricity source shares are weighted by domestic generation. Missing values are excluded from each calculation and never treated as zero.

Expanded 50 uses an energy balance gap:

```text
primary energy consumption - total energy production
```

This is a screening proxy, not a direct observation of net imports.

## Analysis boundaries

| Analysis level | Status | Supported use | What the atlas does not prove |
| --- | --- | --- | --- |
| Descriptive | Performed | Coverage, extrema, rankings, concentration, complete-case correlations, and fixed-market comparisons | Causation, future outcomes, or an optimal market |
| Diagnostic | Partial | Associations and external context can form hypotheses and local diligence questions | Why an observed price, mix, demand, reliability, or balance value occurred |
| Predictive | Not performed | The snapshot can establish a baseline for later forecast design | Future electricity prices, demand, reliability, or emissions |
| Prescriptive | Not performed | A procedural diligence shortlist can order follow-up work | A best market, investment return, or optimal site |

The procedural shortlist is not a prescriptive optimization. Predictive work would require continuous time series, a defined target and horizon, separate training and validation data, and error evaluation. Prescriptive work would require an objective function, weights, site constraints, capital costs, actual contracts, and available grid capacity.

The main data limitations are the non-random market scope, missing values, mixed reference years, flagged fallbacks, national averages, and source-definition differences. Correlations use complete cases and have no confidence intervals or significance tests. The Expanded 50 balance gap is not an observed trade flow.

## Supabase setup

1. Create a Supabase project.
2. Apply [the database migration](supabase/migrations/202609170001_atlas_v2.sql).
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` outside Vite and the repository. Use it only for the server-side seed command.
5. Seed the two protected datasets:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npm run data:seed
```

6. Configure localhost, Vercel preview, and production callback URLs in Supabase. If Google sign-in is enabled, add the corresponding authorized redirect URLs to the Google OAuth client.

The migration revokes anonymous access to the data tables and authenticated view. User-owned profile and saved-view policies require `auth.uid() = user_id` for each operation.

## Local development

Node.js 22 or newer is required.

```bash
npm install
npm run dev
```

Verification commands:

```bash
npm run lint
npm run typecheck
npm test
npm run test:a11y
npm run build
npm run test:e2e
```

Without Supabase environment values, guest analysis remains available. Account creation, sign-in, cloud preferences, and saved views are disabled until Supabase is configured.

## Repository map

```text
data/                 immutable Assignment 15 file and versioned Expanded 50 snapshot
supabase/migrations/  schema, grants, authenticated view, and RLS policies
scripts/              data update, protected seed, document, and deck builders
src/                  routing, auth, state, map, analysis, localization, and tests
e2e/                  auth, filters, insights, navigation, downloads, locale, theme, and network checks
artifacts/            methodology DOCX/PDF, presentation, and reflection
```

## Deliverables

| Course requirement | Public item |
| --- | --- |
| Published site | [Global Energy Decision Atlas](https://global-energy-decision-atlas.vercel.app) |
| Collected dataset | Assignment 15 CSV, Expanded 50 CSV, and source manifest |
| One-page data and methodology note | PDF and editable DOCX |
| Five-minute site demonstration | Seven-slide PPTX and PDF with 300 seconds of speaker notes |
| Short reflection | Three-page PDF and Markdown source |

- [Assignment 15 CSV](data/energy-data.csv)
- [Expanded 50 CSV](data/expanded-energy-50-v1.csv) and [source manifest](data/expanded-energy-50-v1.sources.json)
- [Methodology PDF](artifacts/global-energy-atlas-methodology.pdf)
- [Editable methodology DOCX](artifacts/global-energy-atlas-methodology.docx)
- [Site demonstration PPTX](artifacts/global-energy-atlas-site-demo.pptx) and [PDF](artifacts/global-energy-atlas-site-demo.pdf)
- [Three-page Reflection PDF](artifacts/global-energy-atlas-reflection.pdf) and [Markdown source](artifacts/reflection.md)

The production site is available at [global-energy-decision-atlas.vercel.app](https://global-energy-decision-atlas.vercel.app). Email authentication and account-owned saved views use Supabase; Google OAuth remains optional and requires its own provider configuration. External secrets are not stored in this repository.
