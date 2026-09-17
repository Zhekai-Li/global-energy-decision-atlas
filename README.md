# Global Energy Decision Atlas

Global Energy Decision Atlas is a static decision-support site for business energy and sustainability teams comparing operating-cost, electricity-source, consumption, and import-risk tradeoffs across 15 countries.

The project answers an early screening question: which national markets deserve facility-level energy diligence? It does not collapse unlike measures into a composite score or imply that the cross-sectional data proves causation.

## Deliverables

- **Live site:** [global-energy-decision-atlas.vercel.app](https://global-energy-decision-atlas.vercel.app)
- **Dataset:** [data/energy-data.csv](data/energy-data.csv)
- **Methodology note:** [PDF](artifacts/global-energy-atlas-methodology.pdf) and [editable DOCX](artifacts/global-energy-atlas-methodology.docx)
- **Five-minute presentation:** [PowerPoint](artifacts/global-energy-atlas-presentation.pptx)
- **Reflection:** [artifacts/reflection.md](artifacts/reflection.md)
- **Assignment brief:** [doc/Lesson 03 — Information Web Site.pdf](doc/Lesson%2003%20%E2%80%94%20Information%20Web%20Site.pdf)

## Dashboard

The default comparison uses the United States, Germany, Brazil, and Indonesia. A user can choose up to four countries, switch between household and business retail prices, and sort the detailed table by price, national consumption, non-fossil electricity share, or net imports.

The site includes:

- a price versus non-fossil electricity scatterplot, with bubble area representing total national energy consumption;
- a stacked comparison of domestic electricity generation sources;
- a diverging total-energy net import chart;
- a sortable evidence table with reference periods, units, missing-value treatment, and CSV download;
- selection-specific KPIs and findings;
- practical recommendations, methodology, source links, and limitations;
- an optional demo role that stores only the role and dashboard preferences in `localStorage`.

## Data

The assignment supplied the sole analytical CSV through Google Drive. The file is stored unchanged at [data/energy-data.csv](data/energy-data.csv) and imported into the production bundle as raw text. The application makes no runtime data or API requests.

| Property | Value |
| --- | --- |
| Source | [Assignment-supplied Google Drive file](https://drive.google.com/file/d/1IH_jMJhRQglxaVP0jpVC_D6l3oU_ZoJu/view?usp=sharing) |
| Accessed | 17 September 2026 |
| Rows | 15 country records |
| Columns | 49 |
| SHA-256 | `c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa` |

The parser validates the country and column counts, the schema and URLs, numeric ranges, electricity and primary-energy mix totals within rounding tolerance, and the known missing Iranian household and business prices.

Derived measures are intentionally simple:

- non-fossil electricity = solar + wind + hydro + other;
- fossil electricity = oil and other fossil + gas + coal;
- net imports = gross imports − gross exports.

See [data/README.md](data/README.md) and the [methodology note](artifacts/global-energy-atlas-methodology.pdf) for field definitions, reference dates, and interpretation boundaries.

## Limitations

The measures use mixed reference periods: total energy trade is from 2023, consumption and electricity generation mix are from 2024, and retail prices are for December 2025. Consumption is an absolute national total rather than per capita. USD retail prices inherit source exchange-rate uncertainty. The residual “other” generation category includes nuclear power and other renewables. Iran has no reported retail prices. The 15-country set is useful for comparison but is not a global census.

The data can support screening and question formation. It cannot show that a generation mix causes a retail price, predict tariffs, or establish a location’s grid reliability.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Production and verification commands:

```bash
npm run lint
npm run typecheck
npm test
npm run test:a11y
npm run build
npm run test:e2e
```

Playwright runs the critical workflow on desktop Chrome and a phone-sized Chromium viewport. Unit and component tests cover parsing, schema validation, derived formulas, sorting, missing values, selection limits, audience switching, source links, CSV download, demo session behavior, `localStorage` restoration, and automated accessibility checks.

## Technical design

- React 19, TypeScript, and Vite
- Recharts for responsive visualizations
- Papa Parse and Zod for local CSV parsing and validation
- Vitest, Testing Library, and axe for unit, component, and accessibility checks
- Playwright for desktop and phone browser tests
- GitHub Actions for install, lint, type-check, test, accessibility, build, and browser verification

The production bundle uses system fonts and contains no analytics, external font requests, authentication provider, database, or backend.

## Repository structure

```text
data/              unchanged source CSV and provenance
doc/               assignment brief
src/               application, parsing, validation, and tests
e2e/               Playwright browser tests
artifacts/         methodology, presentation, and reflection deliverables
scripts/           reproducible artifact builders
.github/workflows/ continuous integration
```

## Privacy

The optional session is clearly labeled as a demo. It asks for no name, email address, password, or other personal information. The browser stores only a fixed role and the selected dashboard preferences.
