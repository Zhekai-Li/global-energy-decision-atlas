from __future__ import annotations

import csv
import json
import math
import statistics
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]
ASSIGNMENT_PATH = ROOT / "data" / "energy-data.csv"
EXPANDED_PATH = ROOT / "data" / "expanded-energy-50-v1.csv"
PRESETS_PATH = ROOT / "data" / "story-presets.json"
OUTPUT_PATH = ROOT / "artifacts" / "analysis-summary.json"

EVIDENCE_BOUNDARIES = {
    "descriptive": {
        "status": "performed",
        "supports": [
            "Coverage and missingness counts",
            "Extrema, rankings, medians, and concentration",
            "Pearson correlations calculated from complete cases",
            "Fixed-market comparisons defined in the story presets",
        ],
        "doesNotProve": [
            "Causation",
            "Future outcomes",
            "An optimal market or site",
        ],
        "missingInputs": [],
        "nextWork": [
            "Refresh the snapshot on a defined schedule",
            "Add uncertainty estimates where the data design permits",
        ],
    },
    "diagnostic": {
        "status": "partial",
        "supports": [
            "Association patterns that can motivate hypotheses",
            "External market context that can shape local diligence questions",
        ],
        "doesNotProve": [
            "Why an observed price, generation mix, demand, reliability, or balance value occurred",
            "That a linked external explanation caused an Atlas pattern",
        ],
        "missingInputs": [
            "Matched historical series",
            "Tariff components and customer-class rules",
            "Grid reliability and connection records",
            "A causal identification design",
        ],
        "nextWork": [
            "Test specific explanations with matched local evidence and a stated causal design",
        ],
    },
    "predictive": {
        "status": "notPerformed",
        "supports": [
            "A cross-sectional baseline for defining later forecast work",
        ],
        "doesNotProve": [
            "Future electricity prices",
            "Future energy demand",
            "Future grid reliability",
            "Future emissions",
        ],
        "missingInputs": [
            "Continuous time series",
            "A defined prediction target and forecast horizon",
            "Separate training and validation data",
            "Out-of-sample error evaluation",
        ],
        "nextWork": [
            "Specify the target and horizon before selecting and validating a forecasting model",
        ],
    },
    "prescriptive": {
        "status": "notPerformed",
        "supports": [
            "A procedural diligence shortlist that orders follow-up investigation",
        ],
        "doesNotProve": [
            "A best market",
            "Investment return",
            "An optimal facility location",
        ],
        "missingInputs": [
            "An objective function and decision weights",
            "Site-level constraints",
            "Capital and operating costs",
            "Actual supply contracts",
            "Available grid capacity",
        ],
        "nextWork": [
            "Define the decision objective and constraints, then test options with verified site-level inputs",
        ],
    },
}

DATA_LIMITATIONS = [
    "The Expanded 50 markets are a non-random scope selected for breadth and data availability, not a representative global sample.",
    "Missing values remain missing and reduce the denominator for each metric.",
    "Indicators combine different reference years, and flagged fallbacks may use a value up to two years earlier.",
    "National averages do not represent a facility tariff, contract, connection point, or reliability history.",
    "Source definitions and accounting boundaries can differ across providers.",
    "Pearson correlations use complete cases only, and the analysis does not calculate confidence intervals or statistical significance.",
    "The Expanded 50 balance gap is consumption minus production and is not an observed trade flow.",
]

REGIONS = {
    "North America": ["CAN", "MEX", "USA"],
    "South America": ["ARG", "BRA", "CHL", "COL", "PER"],
    "Europe": ["BEL", "DNK", "FIN", "FRA", "DEU", "ISL", "ITA", "NLD", "NOR", "POL", "RUS", "ESP", "SWE", "CHE", "UKR", "GBR"],
    "Nordics": ["DNK", "FIN", "ISL", "NOR", "SWE"],
    "East Asia": ["CHN", "JPN", "KOR"],
    "South Asia": ["BGD", "IND", "PAK"],
    "Southeast Asia": ["IDN", "MYS", "PHL", "SGP", "THA", "VNM"],
    "Middle East": ["IRN", "SAU", "TUR", "ARE"],
    "Africa": ["DZA", "EGY", "ETH", "KEN", "MAR", "NGA", "ZAF"],
    "Oceania": ["AUS", "NZL"],
}


def number(row: dict[str, str], key: str) -> float | None:
    value = row.get(key, "").strip()
    return float(value) if value else None


def rounded(value: float, digits: int = 3) -> float:
    return round(value, digits)


def describe(values: list[float], total: int, digits: int = 3) -> dict[str, float | int]:
    quartiles = statistics.quantiles(values, n=4, method="inclusive") if len(values) > 1 else [values[0]] * 3
    return {
        "n": len(values),
        "total": total,
        "coveragePct": rounded(len(values) / total * 100, 1) if total else 0,
        "minimum": rounded(min(values), digits),
        "q1": rounded(quartiles[0], digits),
        "median": rounded(statistics.median(values), digits),
        "q3": rounded(quartiles[2], digits),
        "maximum": rounded(max(values), digits),
        "mean": rounded(statistics.mean(values), digits),
    }


def pearson(pairs: list[tuple[float, float]]) -> dict[str, float | int] | None:
    if len(pairs) < 2:
        return None
    xs = [pair[0] for pair in pairs]
    ys = [pair[1] for pair in pairs]
    x_mean, y_mean = statistics.mean(xs), statistics.mean(ys)
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in pairs)
    denominator = math.sqrt(sum((x - x_mean) ** 2 for x in xs) * sum((y - y_mean) ** 2 for y in ys))
    return {"r": rounded(numerator / denominator, 3), "n": len(pairs)} if denominator else None


def summed(row: dict[str, str], keys: tuple[str, ...]) -> float | None:
    values = [number(row, key) for key in keys]
    return None if any(value is None for value in values) else sum(value for value in values if value is not None)


def rank_metric(
    rows: list[dict[str, str]],
    value_for: Callable[[dict[str, str]], float | None],
    count: int = 5,
    digits: int = 3,
) -> dict:
    ranked = sorted(
        [(value, row.get("iso3", ""), row["country"]) for row in rows if (value := value_for(row)) is not None],
        key=lambda item: (item[0], item[2]),
    )

    def pack(items: list[tuple[float, str, str]]) -> list[dict[str, float | str]]:
        return [
            {"iso3": iso3, "country": country, "value": rounded(value, digits)}
            for value, iso3, country in items
        ]

    return {
        "coverage": {
            "complete": len(ranked),
            "total": len(rows),
            "coveragePct": rounded(len(ranked) / len(rows) * 100, 1),
        },
        "lowest": pack(ranked[:count]),
        "highest": pack(list(reversed(ranked[-count:]))),
    }


def price_comparison(rows: list[dict[str, str]], household_key: str, business_key: str) -> dict:
    pairs = []
    for row in rows:
        household = number(row, household_key)
        business = number(row, business_key)
        if household is None or business is None:
            continue
        pairs.append(
            {
                "iso3": row.get("iso3", ""),
                "country": row["country"],
                "household": household,
                "business": business,
                "absoluteDifference": abs(household - business),
                "businessToHouseholdRatio": business / household if household else None,
                "direction": "householdHigher" if household > business else "businessHigher" if business > household else "equal",
            }
        )
    return {
        "coverage": {"complete": len(pairs), "total": len(rows), "coveragePct": rounded(len(pairs) / len(rows) * 100, 1)},
        "largestAbsoluteDifferences": [
            {
                **{key: item[key] for key in ("iso3", "country", "direction")},
                "absoluteDifferenceUsdPerKwh": rounded(item["absoluteDifference"]),
                "businessToHouseholdRatio": rounded(item["businessToHouseholdRatio"]),
            }
            for item in sorted(pairs, key=lambda item: item["absoluteDifference"], reverse=True)[:5]
        ],
        "householdHigher": [item["country"] for item in pairs if item["direction"] == "householdHigher"],
        "businessHigher": [item["country"] for item in pairs if item["direction"] == "businessHigher"],
        "equal": [item["country"] for item in pairs if item["direction"] == "equal"],
    }


def generation_extrema(rows: list[dict[str, str]], keys: dict[str, str]) -> dict:
    return {source: rank_metric(rows, lambda row, key=key: number(row, key), 1, 1)["highest"][0] for source, key in keys.items()}


def assignment_analysis(rows: list[dict[str, str]]) -> dict:
    mix_keys = {
        "solar": "electricity_generation_solar_pct",
        "wind": "electricity_generation_wind_pct",
        "hydro": "electricity_generation_hydro_pct",
        "other": "electricity_generation_other_pct",
        "gas": "electricity_generation_gas_pct",
        "coal": "electricity_generation_coal_pct",
        "oilAndOtherFossil": "electricity_generation_oil_and_other_fossil_pct",
    }
    non_fossil_keys = tuple(mix_keys[key] for key in ("solar", "wind", "hydro", "other"))
    metrics = {
        "householdPriceUsdPerKwh": lambda row: number(row, "household_price_usd_per_kwh"),
        "businessPriceUsdPerKwh": lambda row: number(row, "business_price_usd_per_kwh"),
        "totalEnergyConsumptionEj": lambda row: number(row, "total_energy_consumption_exajoules"),
        "nonFossilElectricityPct": lambda row: summed(row, non_fossil_keys),
        "reportedNetImportsEj": lambda row: number(row, "total_energy_net_imports_ej"),
    }
    columns = {key: [value for row in rows if (value := get_value(row)) is not None] for key, get_value in metrics.items()}
    pairs = [
        (price, share)
        for row in rows
        if (price := metrics["householdPriceUsdPerKwh"](row)) is not None
        and (share := metrics["nonFossilElectricityPct"](row)) is not None
    ]
    return {
        "records": len(rows),
        "periods": {"price": "December 2025", "consumption": "2024", "electricityMix": "2024", "netImports": "2023"},
        "descriptive": {key: describe(values, len(rows), 1 if "Pct" in key or "Ej" in key else 3) for key, values in columns.items()},
        "relationships": {"householdPriceVsNonFossil": pearson(pairs)},
        "extrema": {key: rank_metric(rows, get_value, digits=1 if "Pct" in key or "Ej" in key else 3) for key, get_value in metrics.items()},
        "priceComparison": price_comparison(rows, "household_price_usd_per_kwh", "business_price_usd_per_kwh"),
        "generationSourceLeaders": generation_extrema(rows, mix_keys),
    }


def expanded_analysis(rows: list[dict[str, str]], presets: list[dict]) -> dict:
    mix_keys = {
        "solar": "solar_pct", "wind": "wind_pct", "hydro": "hydro_pct", "other": "other_pct",
        "gas": "gas_pct", "coal": "coal_pct", "oilAndOtherFossil": "oil_other_fossil_pct",
    }
    non_fossil_keys = tuple(mix_keys[key] for key in ("solar", "wind", "hydro", "other"))
    metrics = {
        "householdPriceUsdPerKwh": lambda row: number(row, "household_price_usd_kwh"),
        "businessPriceUsdPerKwh": lambda row: number(row, "business_price_usd_kwh"),
        "primaryEnergyConsumptionEj": lambda row: number(row, "consumption_ej"),
        "totalEnergyProductionEj": lambda row: number(row, "production_ej"),
        "nonFossilElectricityPct": lambda row: summed(row, non_fossil_keys),
        "energyBalanceGapEj": lambda row: number(row, "energy_balance_gap_ej"),
        **{f"{source}ElectricityPct": (lambda row, key=key: number(row, key)) for source, key in mix_keys.items()},
    }
    columns = {key: [value for row in rows if (value := get_value(row)) is not None] for key, get_value in metrics.items()}
    household = columns["householdPriceUsdPerKwh"]
    business = columns["businessPriceUsdPerKwh"]
    consumption = columns["primaryEnergyConsumptionEj"]
    non_fossil_values = columns["nonFossilElectricityPct"]
    balance = columns["energyBalanceGapEj"]
    pair = lambda first, second: [
        (left, right)
        for row in rows
        if (left := metrics[first](row)) is not None and (right := metrics[second](row)) is not None
    ]
    total_consumption = sum(consumption)
    consumers = sorted(
        [(value, row["iso3"], row["country"]) for row in rows if (value := number(row, "consumption_ej")) is not None],
        reverse=True,
    )
    top_five_total = sum(value for value, _, _ in consumers[:5])
    by_code = {row["iso3"]: row for row in rows}
    preset_codes = {preset["storyDataKey"]: preset["config"]["countryCodes"] for preset in presets}

    def country_metric(code: str, key: str, digits: int = 3) -> float | None:
        value = metrics[key](by_code[code])
        return None if value is None else rounded(value, digits)

    def country_snapshot(code: str) -> dict:
        row = by_code[code]
        return {
            "iso3": code,
            "country": row["country"],
            "householdPriceUsdPerKwh": country_metric(code, "householdPriceUsdPerKwh"),
            "businessPriceUsdPerKwh": country_metric(code, "businessPriceUsdPerKwh"),
            "nonFossilElectricityPct": country_metric(code, "nonFossilElectricityPct", 1),
            "hydroElectricityPct": country_metric(code, "hydroElectricityPct", 1),
            "primaryEnergyConsumptionEj": country_metric(code, "primaryEnergyConsumptionEj", 1),
            "energyBalanceGapEj": country_metric(code, "energyBalanceGapEj", 1),
        }

    regional = {}
    for name, codes in REGIONS.items():
        members = [by_code[code] for code in codes]
        prices = [value for row in members if (value := number(row, "household_price_usd_kwh")) is not None]
        uses = [value for row in members if (value := number(row, "consumption_ej")) is not None]
        gaps = [value for row in members if (value := number(row, "energy_balance_gap_ej")) is not None]
        weighted_mix = [
            (share, generation)
            for row in members
            if (share := summed(row, non_fossil_keys)) is not None
            and (generation := number(row, "electricity_generation_twh")) is not None
        ]
        regional[name] = {
            "members": len(members),
            "householdPriceMedianUsdPerKwh": rounded(statistics.median(prices)),
            "priceCoverage": f"{len(prices)}/{len(members)}",
            "consumptionEj": rounded(sum(uses), 1),
            "generationWeightedNonFossilPct": rounded(sum(share * generation for share, generation in weighted_mix) / sum(generation for _, generation in weighted_mix), 1),
            "energyBalanceGapEj": rounded(sum(gaps), 1),
        }

    median_household = statistics.median(household)
    median_non_fossil = statistics.median(non_fossil_values)
    value_transition_markets = [
        {
            "country": row["country"],
            "householdPriceUsdPerKwh": rounded(price),
            "nonFossilPct": rounded(share, 1),
            "energyBalanceGapEj": rounded(number(row, "energy_balance_gap_ej") or 0, 1),
        }
        for row in rows
        if (price := number(row, "household_price_usd_kwh")) is not None
        and (share := summed(row, non_fossil_keys)) is not None
        and price <= median_household
        and share >= median_non_fossil
    ]
    china_share = number(by_code["CHN"], "consumption_ej") / total_consumption * 100
    us_share = number(by_code["USA"], "consumption_ej") / total_consumption * 100
    stories = {
        "europePricePeak": {
            "countries": [country_snapshot(code) for code in preset_codes["europePricePeak"]],
            "italyHasHighestHouseholdPrice": metrics["householdPriceUsdPerKwh"](by_code["ITA"]) == max(household),
            "italyHasHighestBusinessPrice": metrics["businessPriceUsdPerKwh"](by_code["ITA"]) == max(business),
        },
        "ethiopiaPriceStructure": {
            "countries": [country_snapshot(code) for code in preset_codes["ethiopiaPriceStructure"]],
            "ethiopiaHasLowestHouseholdPrice": metrics["householdPriceUsdPerKwh"](by_code["ETH"]) == min(household),
        },
        "chinaUsConsumption": {
            "countries": [country_snapshot(code) for code in preset_codes["chinaUsConsumption"]],
            "reportedConsumptionTotalEj": rounded(total_consumption, 1),
            "chinaSharePct": rounded(china_share, 1),
            "unitedStatesSharePct": rounded(us_share, 1),
            "combinedSharePct": rounded(china_share + us_share, 1),
            "topFiveSharePct": rounded(top_five_total / total_consumption * 100, 1),
        },
        "energyBalanceSplit": {
            "countries": [country_snapshot(code) for code in preset_codes["energyBalanceSplit"]],
            "definition": "Primary energy consumption minus total energy production",
            "positiveCodes": [code for code in preset_codes["energyBalanceSplit"] if number(by_code[code], "energy_balance_gap_ej") > 0],
            "negativeCodes": [code for code in preset_codes["energyBalanceSplit"] if number(by_code[code], "energy_balance_gap_ej") < 0],
        },
    }
    return {
        "records": len(rows),
        "periods": {"price": "2023-2026 average", "consumption": "2023", "production": "2023", "electricityMix": "2023"},
        "descriptive": {
            "householdPriceUsdPerKwh": describe(household, len(rows)),
            "businessPriceUsdPerKwh": describe(business, len(rows)),
            "primaryEnergyConsumptionEj": describe(consumption, len(rows)),
            "nonFossilElectricityPct": describe(non_fossil_values, len(rows), 1),
            "energyBalanceGapEj": describe(balance, len(rows), 1),
        },
        "relationships": {
            "householdPriceVsNonFossil": pearson(pair("householdPriceUsdPerKwh", "nonFossilElectricityPct")),
            "businessPriceVsNonFossil": pearson(pair("businessPriceUsdPerKwh", "nonFossilElectricityPct")),
            "householdPriceVsConsumption": pearson(pair("householdPriceUsdPerKwh", "primaryEnergyConsumptionEj")),
        },
        "extrema": {key: rank_metric(rows, get_value, digits=1 if "Pct" in key or "Ej" in key else 3) for key, get_value in metrics.items()},
        "priceComparison": price_comparison(rows, "household_price_usd_kwh", "business_price_usd_kwh"),
        "generationSourceLeaders": generation_extrema(rows, mix_keys),
        "concentration": {
            "reportedConsumptionTotalEj": rounded(total_consumption, 1),
            "topFiveSharePct": rounded(top_five_total / total_consumption * 100, 1),
            "topFiveMarkets": [
                {"iso3": iso3, "country": country, "consumptionEj": rounded(value, 1), "sharePct": rounded(value / total_consumption * 100, 1)}
                for value, iso3, country in consumers[:5]
            ],
            "combinations": {
                "china": rounded(china_share, 1),
                "unitedStates": rounded(us_share, 1),
                "chinaAndUnitedStates": rounded(china_share + us_share, 1),
                "topFive": rounded(top_five_total / total_consumption * 100, 1),
            },
        },
        "balanceDirection": {
            "positive": sum(1 for value in balance if value > 0),
            "negative": sum(1 for value in balance if value < 0),
            "netAcrossReportedMarketsEj": rounded(sum(balance), 1),
            "largestPositive": rank_metric(rows, metrics["energyBalanceGapEj"], 1, 1)["highest"][0],
            "largestNegative": rank_metric(rows, metrics["energyBalanceGapEj"], 1, 1)["lowest"][0],
        },
        "householdPriceExtrema": rank_metric(rows, metrics["householdPriceUsdPerKwh"]),
        "valueTransitionThresholds": {
            "householdPriceAtOrBelowUsdPerKwh": rounded(median_household),
            "nonFossilAtOrAbovePct": rounded(median_non_fossil, 1),
        },
        "valueTransitionMarkets": sorted(value_transition_markets, key=lambda item: (item["householdPriceUsdPerKwh"], -item["nonFossilPct"])),
        "regionalAggregates": regional,
        "stories": stories,
    }


def main() -> None:
    with ASSIGNMENT_PATH.open(newline="", encoding="utf-8") as file:
        assignment_rows = list(csv.DictReader(file))
    with EXPANDED_PATH.open(newline="", encoding="utf-8") as file:
        expanded_rows = list(csv.DictReader(file))
    presets = json.loads(PRESETS_PATH.read_text(encoding="utf-8"))

    assert len(assignment_rows) == 15 and len({row["country"] for row in assignment_rows}) == 15
    assert len(expanded_rows) == 50 and len({row["iso3"] for row in expanded_rows}) == 50
    assert {preset["storyDataKey"] for preset in presets} == {
        "europePricePeak", "ethiopiaPriceStructure", "chinaUsConsumption", "energyBalanceSplit"
    }

    summary = {
        "generatedFrom": {
            "assignment": "data/energy-data.csv",
            "expanded": "data/expanded-energy-50-v1.csv",
            "storyPresets": "data/story-presets.json",
            "expandedSnapshotDate": "2026-09-17",
        },
        "measureDefinitions": {
            "price": {"meaning": "Residential or business retail electricity price", "unit": "USD/kWh"},
            "nonFossil": {"meaning": "Solar + wind + hydro + other share of domestic electricity generation", "unit": "%"},
            "consumption": {"meaning": "Total primary energy consumption, not per-capita use", "unit": "EJ"},
            "assignmentTrade": {"meaning": "Reported total energy net imports", "unit": "EJ"},
            "expandedBalance": {"meaning": "Primary energy consumption minus total energy production", "unit": "EJ"},
        },
        "evidenceBoundaries": EVIDENCE_BOUNDARIES,
        "dataLimitations": DATA_LIMITATIONS,
        "assignment15": assignment_analysis(assignment_rows),
        "expanded50": expanded_analysis(expanded_rows, presets),
        "interpretationGuardrails": [
            "Pearson correlations describe association, not causation.",
            "Expanded energy balance gap is a screening proxy and is not directly observed net imports.",
            "National retail prices and energy totals do not substitute for facility tariffs, demand charges, or connection studies.",
            "Reference periods differ by indicator and dataset scope.",
            "Assignment 15 and Expanded 50 are scanned separately and never mixed in one ranking.",
            "External sources provide market context and do not prove the cause of an Atlas pattern.",
        ],
    }
    OUTPUT_PATH.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
