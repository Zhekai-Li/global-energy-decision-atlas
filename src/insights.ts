import { nonFossil } from "./analytics";
import { metricValue } from "./state";
import { sharedRegionMembership } from "./regions";
import type { AtlasRecord, DashboardState, MapMetric } from "./types";

export interface SelectionInsight {
  id: string;
  category:
    "benchmark" | "tradeoff" | "concentration" | "exposure" | "confidence";
  tone: "positive" | "neutral" | "watch";
  metric?: MapMetric;
  titleKey: string;
  bodyKey: string;
  values: Record<string, string | number>;
  coverage: {
    complete: number;
    total: number;
    entityKind: "markets" | "regionalAggregates";
    basis: "price" | "priceAndNonFossil" | "consumption" | "currentMetric";
  };
}

const available = (values: Array<number | null>) =>
  values.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
}

export function pearson(
  pairs: Array<[number | null, number | null]>,
): { r: number; n: number } | null {
  const complete = pairs.filter(
    (pair): pair is [number, number] => pair[0] !== null && pair[1] !== null,
  );
  if (complete.length < 5) return null;
  const xMean =
    complete.reduce((sum, pair) => sum + pair[0], 0) / complete.length;
  const yMean =
    complete.reduce((sum, pair) => sum + pair[1], 0) / complete.length;
  const numerator = complete.reduce(
    (sum, pair) => sum + (pair[0] - xMean) * (pair[1] - yMean),
    0,
  );
  const xSpread = Math.sqrt(
    complete.reduce((sum, pair) => sum + (pair[0] - xMean) ** 2, 0),
  );
  const ySpread = Math.sqrt(
    complete.reduce((sum, pair) => sum + (pair[1] - yMean) ** 2, 0),
  );
  if (!xSpread || !ySpread) return null;
  return { r: numerator / (xSpread * ySpread), n: complete.length };
}

export function correlationStrength(
  r: number,
): "little" | "weak" | "moderate" | "strong" | "veryStrong" {
  const magnitude = Math.abs(r);
  if (magnitude < 0.2) return "little";
  if (magnitude < 0.4) return "weak";
  if (magnitude < 0.6) return "moderate";
  if (magnitude < 0.8) return "strong";
  return "veryStrong";
}

function weightedNonFossil(records: AtlasRecord[]): number | null {
  const complete = records.filter(
    (record) =>
      nonFossil(record) !== null && record.electricityGeneration.value !== null,
  );
  const weight = complete.reduce(
    (sum, record) => sum + record.electricityGeneration.value!,
    0,
  );
  return weight
    ? complete.reduce(
        (sum, record) =>
          sum + nonFossil(record)! * record.electricityGeneration.value!,
        0,
      ) / weight
    : null;
}

function coverage(
  records: AtlasRecord[],
  metric: MapMetric,
  audience: DashboardState["priceAudience"],
) {
  const n = available(
    records.map((record) => metricValue(record, metric, audience)),
  ).length;
  const total = records.length;
  return { n, total, pct: total ? (n / total) * 100 : 0 };
}

function number(value: number | null, digits = 1) {
  return value === null ? "n/a" : value.toFixed(digits);
}

function metricSignal(
  state: DashboardState,
  datasetRecords: AtlasRecord[],
  scopeRecords: AtlasRecord[],
  entityKind: SelectionInsight["coverage"]["entityKind"],
): SelectionInsight {
  const scopeCoverage = coverage(
    scopeRecords,
    state.mapMetric,
    state.priceAudience,
  );
  const base = {
    id: `metric-${state.mapMetric}`,
    category: "benchmark" as const,
    metric: state.mapMetric,
    coverage: {
      complete: scopeCoverage.n,
      total: scopeCoverage.total,
      entityKind,
      basis:
        state.mapMetric === "price"
          ? ("price" as const)
          : ("currentMetric" as const),
    },
  };
  if (state.mapMetric === "price") {
    const scopeMedian = median(
      available(
        scopeRecords.map((record) =>
          metricValue(record, "price", state.priceAudience),
        ),
      ),
    );
    const datasetMedian = median(
      available(
        datasetRecords.map((record) =>
          metricValue(record, "price", state.priceAudience),
        ),
      ),
    );
    const delta =
      scopeMedian !== null && datasetMedian
        ? (scopeMedian / datasetMedian - 1) * 100
        : null;
    return {
      ...base,
      tone: delta !== null && delta <= 0 ? "positive" : "watch",
      titleKey: "insights.benchmark.price.title",
      bodyKey: "insights.benchmark.price.body",
      values: {
        scopeMedian: number(scopeMedian, 3),
        datasetMedian: number(datasetMedian, 3),
        deltaPct: number(delta),
        direction: delta !== null && delta <= 0 ? "below" : "above",
        audience: state.priceAudience,
      },
    };
  }
  if (state.mapMetric === "nonFossil") {
    const scopeValue = weightedNonFossil(scopeRecords);
    const datasetValue = weightedNonFossil(datasetRecords);
    return {
      ...base,
      tone:
        scopeValue !== null &&
        datasetValue !== null &&
        scopeValue >= datasetValue
          ? "positive"
          : "neutral",
      titleKey: "insights.benchmark.nonFossil.title",
      bodyKey: "insights.benchmark.nonFossil.body",
      values: {
        scopeValue: number(scopeValue),
        datasetValue: number(datasetValue),
        direction:
          scopeValue !== null &&
          datasetValue !== null &&
          scopeValue >= datasetValue
            ? "above"
            : "below",
      },
    };
  }
  if (state.mapMetric === "consumption") {
    const scopeTotal = available(
      scopeRecords.map((record) => record.consumption.value),
    ).reduce((sum, value) => sum + value, 0);
    const datasetTotal = available(
      datasetRecords.map((record) => record.consumption.value),
    ).reduce((sum, value) => sum + value, 0);
    const largest = [...scopeRecords]
      .filter((record) => record.consumption.value !== null)
      .sort((a, b) => b.consumption.value! - a.consumption.value!)[0];
    return {
      ...base,
      tone: "neutral",
      titleKey: "insights.benchmark.consumption.title",
      bodyKey: "insights.benchmark.consumption.body",
      values: {
        scopeTotal: number(scopeTotal),
        sharePct: number(
          datasetTotal ? (scopeTotal / datasetTotal) * 100 : null,
        ),
        largest: largest?.country ?? "n/a",
        largestSharePct: number(
          largest && scopeTotal
            ? (largest.consumption.value! / scopeTotal) * 100
            : null,
        ),
      },
    };
  }
  const values = scopeRecords.filter(
    (record) => record.tradeExposure.value !== null,
  );
  const net = values.reduce(
    (sum, record) => sum + record.tradeExposure.value!,
    0,
  );
  const gap = [...values].sort(
    (a, b) => b.tradeExposure.value! - a.tradeExposure.value!,
  )[0];
  const surplus = [...values].sort(
    (a, b) => a.tradeExposure.value! - b.tradeExposure.value!,
  )[0];
  return {
    ...base,
    category: "exposure",
    tone: Math.abs(net) > 5 ? "watch" : "neutral",
    titleKey:
      state.datasetScope === "assignment-15"
        ? "insights.benchmark.tradeAssignment.title"
        : "insights.benchmark.tradeExpanded.title",
    bodyKey:
      state.datasetScope === "assignment-15"
        ? "insights.benchmark.tradeAssignment.body"
        : "insights.benchmark.tradeExpanded.body",
    values: {
      net: number(net),
      direction: net >= 0 ? "positive" : "negative",
      gap: gap?.country ?? "n/a",
      gapValue: number(gap?.tradeExposure.value ?? null),
      surplus: surplus?.country ?? "n/a",
      surplusValue: number(surplus?.tradeExposure.value ?? null),
    },
  };
}

export function deriveSelectionInsights(input: {
  state: DashboardState;
  datasetRecords: AtlasRecord[];
  scopeRecords: AtlasRecord[];
  displayRecords: AtlasRecord[];
}): SelectionInsight[] {
  const { state, datasetRecords, displayRecords } = input;
  const scopeRecords = [
    ...new Map(
      input.scopeRecords.map((record) => [record.iso3, record]),
    ).values(),
  ];
  const aggregateMode =
    state.selectionMode === "regions" && state.regionDisplayMode === "aggregate";
  const insightRecords = aggregateMode ? displayRecords : scopeRecords;
  const entityKind: SelectionInsight["coverage"]["entityKind"] = aggregateMode
    ? "regionalAggregates"
    : "markets";
  const priceMedian = median(
    available(
      datasetRecords.map((record) =>
        metricValue(record, "price", state.priceAudience),
      ),
    ),
  );
  const mixMedian = median(available(datasetRecords.map(nonFossil)));
  const candidates = insightRecords.filter((record) => {
    const price = metricValue(record, "price", state.priceAudience);
    const mix = nonFossil(record);
    return (
      price !== null &&
      mix !== null &&
      priceMedian !== null &&
      mixMedian !== null &&
      price <= priceMedian &&
      mix >= mixMedian
    );
  });
  const relationshipPairs = insightRecords.map(
    (record): [number | null, number | null] => [
      metricValue(record, "price", state.priceAudience),
      nonFossil(record),
    ],
  );
  const pairedCount = relationshipPairs.filter(
    ([price, mix]) => price !== null && mix !== null,
  ).length;
  const relationship = pearson(relationshipPairs);
  const scopeConsumption = available(
    insightRecords.map((record) => record.consumption.value),
  ).reduce((sum, value) => sum + value, 0);
  const largest = [...insightRecords]
    .filter((record) => record.consumption.value !== null)
    .sort((a, b) => b.consumption.value! - a.consumption.value!)[0];
  const concentrationCoverage = coverage(
    insightRecords,
    "consumption",
    state.priceAudience,
  );
  const currentCoverage = coverage(
    insightRecords,
    state.mapMetric,
    state.priceAudience,
  );
  const relevantMetric = (record: AtlasRecord) => {
    if (state.mapMetric === "price")
      return state.priceAudience === "household"
        ? record.householdPrice
        : record.businessPrice;
    if (state.mapMetric === "nonFossil") return record.electricityGeneration;
    if (state.mapMetric === "consumption") return record.consumption;
    return record.tradeExposure;
  };
  const relevant = insightRecords.map(relevantMetric);
  const fallbackCount = relevant.filter((item) => item.isFallback).length;
  const periods = new Set(
    relevant
      .filter((item) => item.value !== null)
      .map((item) => item.period)
      .filter(Boolean),
  );
  const overlap =
    state.selectionMode === "regions"
      ? Object.keys(sharedRegionMembership(state.regionIds)).length
      : 0;
  const confidence =
    currentCoverage.pct >= 90
      ? "strong"
      : currentCoverage.pct >= 70
        ? "caution"
        : "limited";
  const displayedCountries = displayRecords.filter(
    (record) => !record.iso3.startsWith("R-"),
  ).length;
  const concentrationBody =
    insightRecords.length < 3
      ? "insights.concentration.percentileBody"
      : "insights.concentration.body";
  const concentrationValues: Record<string, string | number> =
    insightRecords.length < 3
      ? { entities: insightRecords.length, comparisonMetric: state.mapMetric }
      : {
          largest: largest?.country ?? "n/a",
          sharePct: number(
            largest && scopeConsumption
              ? (largest.consumption.value! / scopeConsumption) * 100
              : null,
          ),
          displayed: displayedCountries,
          scope: insightRecords.length,
        };

  const results: SelectionInsight[] = [
    metricSignal(state, datasetRecords, insightRecords, entityKind),
    {
      id: "tradeoff",
      category: "tradeoff",
      tone: candidates.length ? "positive" : "neutral",
      titleKey: "insights.tradeoff.title",
      bodyKey: "insights.tradeoff.body",
      values: {
        count: candidates.length,
        names: candidates.map((record) => record.country).join(", ") || "none",
        priceMedian: number(priceMedian, 3),
        mixMedian: number(mixMedian),
        r: relationship ? relationship.r.toFixed(2) : "n/a",
        correlation: relationship
          ? correlationStrength(relationship.r)
          : "insufficient",
        correlationN: relationship?.n ?? 0,
      },
      coverage: {
        complete: pairedCount,
        total: insightRecords.length,
        entityKind,
        basis: "priceAndNonFossil",
      },
    },
    {
      id: "concentration",
      category: "concentration",
      tone:
        insightRecords.length < 3 ||
        (largest &&
          scopeConsumption &&
          largest.consumption.value! / scopeConsumption > 0.5)
          ? "watch"
          : "neutral",
      titleKey:
        insightRecords.length < 3
          ? "insights.concentration.percentileTitle"
          : "insights.concentration.title",
      bodyKey: concentrationBody,
      values: concentrationValues,
      coverage: {
        complete: concentrationCoverage.n,
        total: concentrationCoverage.total,
        entityKind,
        basis: "consumption",
      },
    },
    {
      id: "confidence",
      category: "confidence",
      tone:
        confidence === "strong"
          ? "positive"
          : confidence === "caution"
            ? "neutral"
            : "watch",
      titleKey: `insights.confidence.${confidence}Title`,
      bodyKey: "insights.confidence.body",
      values: {
        reported: currentCoverage.n,
        total: currentCoverage.total,
        coveragePct: number(currentCoverage.pct, 0),
        fallback: fallbackCount,
        missing: currentCoverage.total - currentCoverage.n,
        periods: periods.size,
        overlap,
      },
      coverage: {
        complete: currentCoverage.n,
        total: currentCoverage.total,
        entityKind,
        basis: "currentMetric",
      },
    },
  ];
  return results.slice(0, 4);
}
