import { z } from "zod";
import rawStoryPresets from "../data/story-presets.json";
import { dashboardStateSchema } from "./state";
import type { DashboardState } from "./types";

const storyConfigSchema = dashboardStateSchema.omit({
  locale: true,
  theme: true,
});

export const storyPresetSchema = z.object({
  id: z.enum([
    "europe-price-peak",
    "ethiopia-price-structure",
    "china-us-consumption",
    "energy-balance-split",
  ]),
  storyDataKey: z.enum([
    "europePricePeak",
    "ethiopiaPriceStructure",
    "chinaUsConsumption",
    "energyBalanceSplit",
  ]),
  config: storyConfigSchema,
});

export type StoryPreset = z.infer<typeof storyPresetSchema>;
export type StoryPresetId = StoryPreset["id"];

export const storyPresets = z.array(storyPresetSchema).length(4).parse(rawStoryPresets);

const sameArray = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export function applyStoryPreset(
  state: DashboardState,
  preset: StoryPreset,
): DashboardState {
  return dashboardStateSchema.parse({
    ...preset.config,
    locale: state.locale,
    theme: state.theme,
  });
}

export function matchesStoryPreset(
  state: DashboardState,
  preset: StoryPreset,
): boolean {
  const config = preset.config;
  return (
    state.datasetScope === config.datasetScope &&
    state.selectionMode === config.selectionMode &&
    sameArray(state.regionIds, config.regionIds) &&
    sameArray(state.countryCodes, config.countryCodes) &&
    sameArray(state.focusCountryCodes, config.focusCountryCodes) &&
    state.regionDisplayMode === config.regionDisplayMode &&
    state.priceAudience === config.priceAudience &&
    state.mapMetric === config.mapMetric &&
    state.sortMetric === config.sortMetric
  );
}
