import { describe, expect, it } from "vitest";
import analysisSummary from "../../artifacts/analysis-summary.json";
import rawExpanded from "../../data/expanded-energy-50-v1.csv?raw";
import { parseExpandedCsv } from "../data-v2";
import { DEFAULT_STATE } from "../state";
import {
  applyStoryPreset,
  matchesStoryPreset,
  storyPresets,
} from "../story-presets";

const records = parseExpandedCsv(rawExpanded);

describe("story presets and generated evidence", () => {
  it("validates four complete fixed configurations", () => {
    expect(storyPresets).toHaveLength(4);
    for (const preset of storyPresets) {
      expect(preset.config).toMatchObject({
        datasetScope: "expanded-50",
        selectionMode: "countries",
        regionIds: ["global"],
        regionDisplayMode: "members",
        priceAudience: "household",
      });
      expect(preset.config.countryCodes).toEqual(preset.config.focusCountryCodes);
      expect(preset.config.countryCodes).toHaveLength(5);
    }
  });

  it("preserves locale and theme while applying the full analysis state", () => {
    const preset = storyPresets[1];
    const applied = applyStoryPreset(
      { ...DEFAULT_STATE, locale: "ar", theme: "dark" },
      preset,
    );
    expect(applied.locale).toBe("ar");
    expect(applied.theme).toBe("dark");
    expect(matchesStoryPreset(applied, preset)).toBe(true);
    expect(matchesStoryPreset({ ...applied, sortMetric: "price" }, preset)).toBe(false);
  });

  it("derives extrema, combination shares, and story facts from Expanded 50", () => {
    const expanded = analysisSummary.expanded50;
    expect(expanded.extrema.householdPriceUsdPerKwh.highest[0]).toMatchObject({ country: "Italy", value: 0.414 });
    expect(expanded.extrema.householdPriceUsdPerKwh.lowest[0]).toMatchObject({ country: "Ethiopia", value: 0.006 });
    expect(expanded.concentration.combinations).toEqual({ china: 31.1, unitedStates: 17.3, chinaAndUnitedStates: 48.4, topFive: 64.6 });
    expect(expanded.stories.europePricePeak).toMatchObject({ italyHasHighestHouseholdPrice: true, italyHasHighestBusinessPrice: true });
    expect(expanded.stories.ethiopiaPriceStructure).toMatchObject({ ethiopiaHasLowestHouseholdPrice: true });
    expect(expanded.stories.energyBalanceSplit.positiveCodes).toEqual(["CHN", "IND", "JPN"]);
    expect(expanded.stories.energyBalanceSplit.negativeCodes).toEqual(["RUS", "USA"]);
  });

  it("records missing-data coverage without treating missing values as zero", () => {
    const reportedHousehold = records.filter((record) => record.householdPrice.value !== null).length;
    const coverage = analysisSummary.expanded50.extrema.householdPriceUsdPerKwh.coverage;
    expect(coverage).toEqual({ complete: reportedHousehold, total: 50, coveragePct: 94 });
    expect(reportedHousehold).toBeLessThan(records.length);
  });

  it("keeps Assignment 15 and Expanded 50 extrema in separate branches", () => {
    expect(analysisSummary.assignment15.records).toBe(15);
    expect(analysisSummary.expanded50.records).toBe(50);
    expect(analysisSummary.assignment15.extrema.reportedNetImportsEj).toBeDefined();
    expect(analysisSummary.expanded50.extrema.energyBalanceGapEj).toBeDefined();
  });
});
