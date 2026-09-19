# Energy data provenance

## Assignment 15

`energy-data.csv` is the unchanged file linked from the assignment brief.

- Source URL: https://drive.google.com/file/d/1IH_jMJhRQglxaVP0jpVC_D6l3oU_ZoJu/view?usp=sharing
- Accessed: 17 September 2026
- Records: 15 countries
- Columns: 49
- SHA-256: `c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa`

The trade field is the file's reported total energy net imports. Iran has blank household and business price fields. Both remain missing and are excluded from price calculations.

## Expanded 50

`expanded-energy-50-v1.csv` is a versioned snapshot created by `scripts/update-expanded-data.mjs`. `expanded-energy-50-v1.sources.json` records the checksum and source selection.

The snapshot uses:

- the public 2023 to 2026 residential and business price averages from GlobalPetrolPrices;
- primary energy consumption and electricity generation fields from the OWID Energy CSV;
- total energy production from the no-key EIA International bulk download.

The update chooses the latest year that covers at least 90 percent of the 50 countries for each indicator group. It permits a country-level fallback of at most two years. A missing value beyond that limit remains blank.

Expanded energy balance gap equals primary energy consumption minus total energy production. It is derived from two sources with different accounting conventions. Do not relabel it as observed net imports.

The update script validates the exact 50-country ISO3 set, the presence of every Assignment 15 country, required source fields, percentage ranges, generation-share totals, source URLs, access dates, fallback years, missing rates, and the output checksum. It stops if the public price table marker or source columns change.

Authenticated sessions read validated records from an RLS-protected Supabase view. Guest sessions lazy-load the same validated snapshots for analysis but do not receive cloud persistence, saved views, or activity history. The service-role seed script writes records to Supabase, and its key is never included in the browser bundle.
