# Energy Dataset Provenance

`energy-data.csv` is the unchanged dataset linked from the assignment brief.

- Source URL: https://drive.google.com/file/d/1IH_jMJhRQglxaVP0jpVC_D6l3oU_ZoJu/view?usp=sharing
- Accessed: 17 September 2026
- Records: 15 countries
- Columns: 49
- SHA-256: `c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa`

The source URLs inside each record identify the underlying retail price, consumption, generation mix, and energy trade publications. The application displays those citations but does not query them at runtime.

Iran has blank household and business retail electricity prices. The application preserves those cells as missing and displays `N/A`.
