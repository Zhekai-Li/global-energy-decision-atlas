import { describe, expect, it } from "vitest";
import rawCsv from "../../data/energy-data.csv?raw";
import expandedCsv from "../../data/expanded-energy-50-v1.csv?raw";
import analysisSummary from "../../artifacts/analysis-summary.json";
import {
  aggregateRegion,
  electricityMixTicks,
  formatPercentTick,
  nonFossil,
  normalizeElectricityMix,
} from "../analytics";
import { parseExpandedCsv } from "../data-v2";
import {
  energyRecords,
  evidenceFor,
  parseEnergyCsv,
  sortComparisons,
  toComparison,
} from "../data";
import { regionsForCountries } from "../regions";

describe("energy data pipeline", () => {
  it("parses and validates the supplied dataset", () => {
    const records = parseEnergyCsv(rawCsv);
    expect(records).toHaveLength(15);
    expect(new Set(records.map((row) => row.country)).size).toBe(15);
    expect(
      Object.values(records[0].electricity).reduce(
        (sum, value) => sum + value,
        0,
      ),
    ).toBeCloseTo(100, 1);
  });

  it("derives fossil and non-fossil shares without a composite score", () => {
    const brazil = toComparison(
      energyRecords.find((row) => row.country === "Brazil")!,
      "business",
    );
    expect(brazil.nonFossilElectricityPct).toBeCloseTo(89.45, 2);
    expect(brazil.fossilElectricityPct).toBeCloseTo(10.55, 2);
    expect(
      brazil.nonFossilElectricityPct + brazil.fossilElectricityPct,
    ).toBeCloseTo(100, 1);
    expect(brazil.selectedPriceUsd).toBe(0.158);
  });

  it("preserves Iranian missing prices as null and sorts them last", () => {
    const rows = energyRecords.map((row) => toComparison(row, "household"));
    const iran = rows.find((row) => row.country === "Iran")!;
    expect(iran.selectedPriceUsd).toBeNull();
    expect(sortComparisons(rows, "price").at(-1)?.country).toBe("Iran");
  });

  it("sorts each supported decision metric deterministically", () => {
    const rows = energyRecords.map((row) => toComparison(row, "business"));
    expect(sortComparisons(rows, "price")[0].country).toBe("Indonesia");
    expect(sortComparisons(rows, "consumption")[0].country).toBe("China");
    expect(sortComparisons(rows, "nonFossil")[0].country).toBe("France");
    expect(sortComparisons(rows, "netImports")[0].country).toBe("China");
  });

  it("generates recommendations evidence from the current selection", () => {
    const rows = ["United States", "Germany", "Brazil", "Indonesia"].map(
      (country) =>
        toComparison(
          energyRecords.find((row) => row.country === country)!,
          "household",
        ),
    );
    const evidence = evidenceFor(rows);
    expect(evidence.lowest.country).toBe("Indonesia");
    expect(evidence.cleanest.country).toBe("Brazil");
    expect(evidence.mostExposed.country).toBe("Germany");
  });

  it("rejects a generation mix outside the 100 percent tolerance", () => {
    const broken = rawCsv.replace(",8.32,9.88,0.88,", ",80.32,9.88,0.88,");
    expect(() => parseEnergyCsv(broken)).toThrow(/Mix total/);
  });
});

describe("expanded 50 data and aggregation", () => {
  const records = parseExpandedCsv(expandedCsv);

  it("validates 50 unique ISO3 countries and preserves the assignment markets", () => {
    expect(records).toHaveLength(50);
    expect(new Set(records.map((record) => record.iso3)).size).toBe(50);
    for (const code of [
      "CHN",
      "USA",
      "IND",
      "RUS",
      "JPN",
      "CAN",
      "DEU",
      "BRA",
      "KOR",
      "IRN",
      "SAU",
      "IDN",
      "FRA",
      "MEX",
      "GBR",
    ])
      expect(records.some((record) => record.iso3 === code)).toBe(true);
  });

  it("derives the energy balance gap from consumption minus production", () => {
    const usa = records.find((record) => record.iso3 === "USA")!;
    expect(usa.tradeExposure.value).toBeCloseTo(
      usa.consumption.value! - usa.production.value!,
      5,
    );
    expect(usa.tradeExposure.method).toBe("derived");
  });

  it("uses medians, sums, and generation-weighted mix for regions", () => {
    const nordics = aggregateRegion("nordics", records, "household");
    expect(nordics.memberCount).toBe(5);
    expect(nordics.priceCoverage).toBeGreaterThanOrEqual(4);
    expect(nordics.consumption.value).toBeGreaterThan(0);
    expect(
      Object.values(nordics.electricity).reduce(
        (sum, value) => sum + (value ?? 0),
        0,
      ),
    ).toBeCloseTo(100, 0);
  });

  it("records missing-data coverage and complete-case correlation denominators", () => {
    const completeHouseholdMix = records.filter(
      (record) => record.householdPrice.value !== null && nonFossil(record) !== null,
    ).length;
    const completeBusinessMix = records.filter(
      (record) => record.businessPrice.value !== null && nonFossil(record) !== null,
    ).length;
    const completeHouseholdConsumption = records.filter(
      (record) => record.householdPrice.value !== null && record.consumption.value !== null,
    ).length;
    expect(analysisSummary.expanded50.descriptive.householdPriceUsdPerKwh.n).toBe(
      records.filter((record) => record.householdPrice.value !== null).length,
    );
    expect(analysisSummary.expanded50.relationships.householdPriceVsNonFossil.n).toBe(completeHouseholdMix);
    expect(analysisSummary.expanded50.relationships.businessPriceVsNonFossil.n).toBe(completeBusinessMix);
    expect(analysisSummary.expanded50.relationships.householdPriceVsConsumption.n).toBe(completeHouseholdConsumption);
  });

  it("defines the four analysis levels with the required statuses and boundaries", () => {
    expect(
      Object.fromEntries(
        Object.entries(analysisSummary.evidenceBoundaries).map(([level, boundary]) => [
          level,
          boundary.status,
        ]),
      ),
    ).toEqual({
      descriptive: "performed",
      diagnostic: "partial",
      predictive: "notPerformed",
      prescriptive: "notPerformed",
    });
    for (const boundary of Object.values(analysisSummary.evidenceBoundaries)) {
      expect(boundary.supports.length).toBeGreaterThan(0);
      expect(boundary.doesNotProve.length).toBeGreaterThan(0);
      expect(boundary.nextWork.length).toBeGreaterThan(0);
      expect(Array.isArray(boundary.missingInputs)).toBe(true);
    }
    expect(analysisSummary.dataLimitations).toContain(
      "The Expanded 50 balance gap is consumption minus production and is not an observed trade flow.",
    );
  });
});

describe("electricity mix display normalization", () => {
  it("leaves the source object unchanged and makes a complete mix total exactly 100", () => {
    const source = {
      solar: 12.1001,
      wind: 21.2002,
      hydro: 30.3003,
      other: 4.4004,
      gas: 18.5005,
      coal: 9.6006,
      oilAndOtherFossil: 3.9001,
    };
    const snapshot = { ...source };
    const normalized = normalizeElectricityMix(source);
    expect(source).toEqual(snapshot);
    expect(
      Object.values(normalized).reduce((sum, value) => sum + (value ?? 0), 0),
    ).toBe(100);
  });

  it("preserves null categories and normalizes aggregate-style values", () => {
    const normalized = normalizeElectricityMix({
      solar: 10,
      wind: 20,
      hydro: null,
      other: 5,
      gas: 25,
      coal: 30,
      oilAndOtherFossil: 9.998,
    });
    expect(normalized.hydro).toBeNull();
    expect(
      Object.values(normalized).reduce((sum, value) => sum + (value ?? 0), 0),
    ).toBe(100);
  });

  it("returns an empty mix unchanged", () => {
    const empty = {
      solar: null,
      wind: null,
      hydro: null,
      other: null,
      gas: null,
      coal: null,
      oilAndOtherFossil: null,
    };
    expect(normalizeElectricityMix(empty)).toEqual(empty);
  });

  it("uses fixed integer percentage ticks", () => {
    expect(electricityMixTicks).toEqual([0, 25, 50, 75, 100]);
    expect(electricityMixTicks.map(formatPercentTick)).toEqual([
      "0%",
      "25%",
      "50%",
      "75%",
      "100%",
    ]);
  });
});

describe("dataset-aware region presets", () => {
  const assignmentCodes = [
    "CHN",
    "USA",
    "IND",
    "RUS",
    "JPN",
    "CAN",
    "DEU",
    "BRA",
    "KOR",
    "IRN",
    "SAU",
    "IDN",
    "FRA",
    "MEX",
    "GBR",
  ];

  it("shows only regions with at least one country in the active dataset", () => {
    const ids = regionsForCountries(assignmentCodes).map((region) => region.id);
    expect(ids).toEqual([
      "global",
      "north-america",
      "south-america",
      "latin-america",
      "europe",
      "east-asia",
      "south-asia",
      "southeast-asia",
      "middle-east",
      "asia-pacific",
    ]);
    expect(ids).not.toContain("nordics");
    expect(ids).not.toContain("central-asia");
    expect(ids).not.toContain("africa");
    expect(ids).not.toContain("oceania");
  });
});
