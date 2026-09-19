import { REGIONS } from "./regions";
import { metricValue } from "./state";
import type {
  AtlasRecord,
  DashboardState,
  EnergyMix,
  MetricValue,
} from "./types";

export interface AggregateRecord extends AtlasRecord {
  memberCount: number;
  priceCoverage: number;
}

const median = (values: number[]) => {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
};

const sumMetric = (
  records: AtlasRecord[],
  key: "consumption" | "production" | "tradeExposure",
): MetricValue => {
  const available = records
    .map((record) => record[key])
    .filter((item) => item.value !== null);
  return {
    value: available.length
      ? available.reduce((sum, item) => sum + item.value!, 0)
      : null,
    unit: "EJ",
    period:
      [...new Set(available.map((item) => item.period).filter(Boolean))].join(
        ", ",
      ) || null,
    sourceId: key === "tradeExposure" ? "regional-derived" : "regional-sum",
    method: key === "tradeExposure" ? "derived" : "reported",
    isFallback: available.some((item) => item.isFallback),
  };
};

const weightedMix = (records: AtlasRecord[]): EnergyMix => {
  const keys: (keyof EnergyMix)[] = [
    "solar",
    "wind",
    "hydro",
    "other",
    "gas",
    "coal",
    "oilAndOtherFossil",
  ];
  return Object.fromEntries(
    keys.map((key) => {
      const available = records.filter(
        (record) =>
          record.electricity[key] !== null &&
          record.electricityGeneration.value !== null,
      );
      const weight = available.reduce(
        (sum, record) => sum + record.electricityGeneration.value!,
        0,
      );
      return [
        key,
        weight
          ? available.reduce(
              (sum, record) =>
                sum +
                record.electricity[key]! * record.electricityGeneration.value!,
              0,
            ) / weight
          : null,
      ];
    }),
  ) as unknown as EnergyMix;
};

const mixKeys: (keyof EnergyMix)[] = [
  "solar",
  "wind",
  "hydro",
  "other",
  "gas",
  "coal",
  "oilAndOtherFossil",
];

export const electricityMixTicks = [0, 25, 50, 75, 100] as const;
export const formatPercentTick = (value: number) => `${Math.round(value)}%`;

/**
 * Normalizes a complete electricity mix for display without mutating the source
 * record. The final populated category absorbs the floating-point remainder so
 * a stacked chart ends at exactly 100 percent.
 */
export function normalizeElectricityMix(mix: EnergyMix): EnergyMix {
  const populated = mixKeys.filter((key) => mix[key] !== null);
  const total = populated.reduce((sum, key) => sum + (mix[key] ?? 0), 0);
  if (!populated.length || !Number.isFinite(total) || total <= 0)
    return { ...mix };

  const normalized = { ...mix };
  let assigned = 0;
  populated.forEach((key, index) => {
    if (index === populated.length - 1) normalized[key] = 100 - assigned;
    else {
      const value = ((mix[key] ?? 0) * 100) / total;
      normalized[key] = value;
      assigned += value;
    }
  });
  return normalized;
}

export function aggregateRegion(
  regionId: string,
  allRecords: AtlasRecord[],
  audience: DashboardState["priceAudience"],
): AggregateRecord {
  const region = REGIONS.find((item) => item.id === regionId);
  if (!region) throw new Error(`Unknown region: ${regionId}`);
  const members =
    region.id === "global"
      ? allRecords
      : allRecords.filter((record) => region.members.includes(record.iso3));
  const household = members
    .map((record) => record.householdPrice.value)
    .filter((value): value is number => value !== null);
  const business = members
    .map((record) => record.businessPrice.value)
    .filter((value): value is number => value !== null);
  const chosen = audience === "household" ? household : business;
  const priceMetric = (
    values: number[],
    audienceName: string,
  ): MetricValue => ({
    value: median(values),
    unit: "USD/kWh",
    period: "mixed",
    sourceId: `regional-${audienceName}-median`,
    method: "derived",
    isFallback: false,
  });
  const generation = sumMetric(members, "consumption");
  generation.value =
    members
      .map((record) => record.electricityGeneration.value)
      .filter((value): value is number => value !== null)
      .reduce((sum, value) => sum + value, 0) || null;
  generation.unit = "TWh";
  return {
    datasetScope: allRecords[0]?.datasetScope ?? "expanded-50",
    iso3: `R-${regionId}`,
    country: region.labelKey,
    householdPrice: priceMetric(household, "household"),
    businessPrice: priceMetric(business, "business"),
    consumption: sumMetric(members, "consumption"),
    production: sumMetric(members, "production"),
    tradeExposure: sumMetric(members, "tradeExposure"),
    electricityGeneration: generation,
    electricity: weightedMix(members),
    sources: {},
    memberCount: members.length,
    priceCoverage: chosen.length,
  };
}

export function nonFossil(record: AtlasRecord): number | null {
  return metricValue(record, "nonFossil", "household");
}

export function comparisonValue(
  record: AtlasRecord,
  metric: DashboardState["sortMetric"],
  audience: DashboardState["priceAudience"],
) {
  return metricValue(record, metric, audience);
}

export function sortedRecords(
  records: AtlasRecord[],
  metric: DashboardState["sortMetric"],
  audience: DashboardState["priceAudience"],
) {
  return [...records].sort((a, b) => {
    const av = comparisonValue(a, metric, audience);
    const bv = comparisonValue(b, metric, audience);
    if (av === null) return 1;
    if (bv === null) return -1;
    return metric === "price" ? av - bv : bv - av;
  });
}
