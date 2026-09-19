import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import {
  aggregateRegion,
  electricityMixTicks,
  formatPercentTick,
  nonFossil,
  normalizeElectricityMix,
  sortedRecords,
  type AggregateRecord,
} from "../analytics";
import { WorldMap } from "../components/WorldMap";
import { PreferenceControls } from "../components/PreferenceControls";
import { AtlasNavigation } from "../components/AtlasNavigation";
import { FilterRail } from "../components/FilterRail";
import { openFilterRail } from "../filter-rail-events";
import {
  createSavedView,
  deleteSavedView,
  fetchAtlasRecords,
  fetchProfile,
  fetchSavedViews,
  renameSavedView,
  saveProfile,
} from "../lib/api";
import {
  countriesForRegions,
  normalizeRegionSelection,
  regionsForCountries,
  sharedRegionMembership,
} from "../regions";
import {
  metricValue,
  reconcileState,
  saveLocalState,
  topFocusCountries,
} from "../state";
import { deriveSelectionInsights, median } from "../insights";
import {
  applyStoryPreset,
  matchesStoryPreset,
  storyPresets,
  type StoryPreset,
} from "../story-presets";
import heroImage from "../assets/energy-hero.webp";
import analysisSummary from "../../artifacts/analysis-summary.json";
import sourceManifest from "../../data/expanded-energy-50-v1.sources.json";
import type { AtlasRecord, DashboardState, SavedView } from "../types";

const colors = [
  "#087f5b",
  "#d97732",
  "#3973a4",
  "#8b6daa",
  "#bb4d5b",
  "#71843f",
  "#bd8b1d",
  "#327e80",
];
const mixColors = {
  solar: "#eab44d",
  wind: "#6fa7a2",
  hydro: "#397db1",
  other: "#8b72aa",
  gas: "#d57755",
  coal: "#555953",
  oilAndOtherFossil: "#9a7259",
};

const storySourceIds: Record<StoryPreset["id"], string[]> = {
  "europe-price-peak": ["iea-italy-2023", "eurostat-energy-data"],
  "ethiopia-price-structure": ["world-bank-ethiopia-energy-compact"],
  "china-us-consumption": ["iea-electricity-2025"],
  "energy-balance-split": [
    "eia-us-energy-balance-2023",
    "eia-russia-country-analysis",
  ],
};

const contextSourceById = new Map(
  sourceManifest.contextSources.map((source) => [source.id, source]),
);

type StoryCountry = {
  iso3: string;
  country: string;
  householdPriceUsdPerKwh: number | null;
  businessPriceUsdPerKwh: number | null;
  nonFossilElectricityPct: number | null;
  hydroElectricityPct: number | null;
  primaryEnergyConsumptionEj: number | null;
  energyBalanceGapEj: number | null;
};

const storyAnalysis = analysisSummary.expanded50.stories;
const evidenceBoundaryLevels = [
  "descriptive",
  "diagnostic",
  "predictive",
  "prescriptive",
] as const;

function storyCountry(countries: StoryCountry[], code: string) {
  const country = countries.find((item) => item.iso3 === code);
  if (!country) throw new Error(`Story evidence is missing ${code}`);
  return country;
}

function localizedCountry(record: AtlasRecord, locale: string) {
  if (record.iso3.startsWith("R-")) return record.country;
  try {
    return (
      new Intl.DisplayNames([locale], { type: "region" }).of(record.iso3) ??
      record.country
    );
  } catch {
    return record.country;
  }
}

function downloadCsv(rows: AtlasRecord[], state: DashboardState) {
  const header = [
    "entity_type",
    "iso3",
    "region_id",
    "country_en",
    "price_audience",
    "price_usd_per_kwh",
    "price_period",
    "total_energy_consumption_ej",
    "consumption_period",
    "non_fossil_electricity_pct",
    "electricity_mix_period",
    state.datasetScope === "assignment-15"
      ? "total_energy_net_imports_ej"
      : "energy_balance_gap_ej",
    "balance_period",
  ];
  const lines = rows.map((row) => {
    const price =
      state.priceAudience === "household"
        ? row.householdPrice
        : row.businessPrice;
    return [
      row.iso3.startsWith("R-") ? "region" : "country",
      row.iso3.startsWith("R-") ? "" : row.iso3,
      row.iso3.startsWith("R-") ? row.iso3.slice(2) : "",
      row.country,
      state.priceAudience,
      price.value ?? "",
      price.period ?? "",
      row.consumption.value ?? "",
      row.consumption.period ?? "",
      nonFossil(row) ?? "",
      row.electricityGeneration.period ?? "",
      row.tradeExposure.value ?? "",
      row.tradeExposure.period ?? "",
    ];
  });
  const escape = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const blob = new Blob(
    [[header, ...lines].map((line) => line.map(escape).join(",")).join("\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `energy-atlas-${state.datasetScope}-${state.priceAudience}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AtlasPage({
  userId,
  email,
  initialState,
  records: suppliedRecords,
  isGuest = false,
  onStateChange,
  onSignOut,
}: {
  userId: string;
  email?: string;
  initialState: DashboardState;
  records?: AtlasRecord[];
  isGuest?: boolean;
  onStateChange: (state: DashboardState) => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState(initialState);
  const [records, setRecords] = useState<AtlasRecord[]>(suppliedRecords ?? []);
  const [loading, setLoading] = useState(!suppliedRecords);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(Boolean(suppliedRecords));
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [viewName, setViewName] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [storyAnnouncement, setStoryAnnouncement] = useState("");
  const initialStateRef = useRef({ userId, state: initialState });
  if (initialStateRef.current.userId !== userId)
    initialStateRef.current = { userId, state: initialState };

  useEffect(() => {
    if (suppliedRecords) return;
    let active = true;
    Promise.all([
      fetchAtlasRecords(),
      fetchProfile(userId),
      fetchSavedViews(userId),
    ])
      .then(([nextRecords, profile, views]) => {
        if (!active) return;
        if (!nextRecords.length)
          throw new Error("No energy records were returned");
        const localState = initialStateRef.current.state;
        const base = profile.dashboardState ?? {
          ...localState,
          theme: profile.theme ?? localState.theme,
          locale: profile.locale ?? localState.locale,
        };
        const next = reconcileState(base, nextRecords);
        setRecords(nextRecords);
        setState(next);
        setSavedViews(views);
        setHydrated(true);
        setLoading(false);
        if (!profile.dashboardState) void saveProfile(userId, next);
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [suppliedRecords, userId]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isGuest) saveLocalState(state);
    onStateChange(state);
    if (suppliedRecords) return;
    const timer = window.setTimeout(
      () =>
        saveProfile(userId, state).catch((cause) =>
          setError(cause instanceof Error ? cause.message : String(cause)),
        ),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [hydrated, isGuest, onStateChange, state, suppliedRecords, userId]);

  const update = (patch: Partial<DashboardState>) =>
    setState((current) => ({ ...current, ...patch }));
  const scopeRecords = useMemo(
    () =>
      records.filter((record) => record.datasetScope === state.datasetScope),
    [records, state.datasetScope],
  );
  const availableRegions = useMemo(
    () => regionsForCountries(scopeRecords.map((record) => record.iso3)),
    [scopeRecords],
  );
  const recordByCode = useMemo(
    () => new Map(scopeRecords.map((record) => [record.iso3, record])),
    [scopeRecords],
  );
  const scoped = state.countryCodes
    .map((code) => recordByCode.get(code))
    .filter((record): record is AtlasRecord => Boolean(record));
  const focus = state.focusCountryCodes
    .map((code) => recordByCode.get(code))
    .filter(
      (record): record is AtlasRecord =>
        Boolean(record) && state.countryCodes.includes(record!.iso3),
    );
  const displayRecords: (AtlasRecord | AggregateRecord)[] =
    state.selectionMode === "regions" && state.regionDisplayMode === "aggregate"
      ? state.regionIds.map((id) =>
          aggregateRegion(id, scopeRecords, state.priceAudience),
        )
      : focus;
  const sorted = sortedRecords(
    displayRecords,
    state.sortMetric,
    state.priceAudience,
  );
  const locale = state.locale;
  const format = (value: number | null, digits = 1) =>
    value === null
      ? t("common.notAvailable")
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: digits,
          minimumFractionDigits: digits,
        }).format(value);
  const displayPriceValues = displayRecords
    .map((record) => metricValue(record, "price", state.priceAudience))
    .filter((value): value is number => value !== null);
  const medianPrice = median(displayPriceValues);
  const datasetPriceMedian = median(
    scopeRecords
      .map((record) => metricValue(record, "price", state.priceAudience))
      .filter((value): value is number => value !== null),
  );
  const datasetMixMedian = median(
    scopeRecords
      .map(nonFossil)
      .filter((value): value is number => value !== null),
  );
  const totalConsumption = scoped
    .map((record) => record.consumption.value)
    .filter((value): value is number => value !== null)
    .reduce((a, b) => a + b, 0);
  const generationWeight = scoped
    .map((record) => record.electricityGeneration.value ?? 0)
    .reduce((a, b) => a + b, 0);
  const weightedNonFossil = generationWeight
    ? scoped.reduce(
        (sum, record) =>
          sum +
          (nonFossil(record) ?? 0) * (record.electricityGeneration.value ?? 0),
        0,
      ) / generationWeight
    : null;
  const totalTrade = scoped
    .map((record) => record.tradeExposure.value)
    .filter((value): value is number => value !== null)
    .reduce((a, b) => a + b, 0);
  const overlaps = Object.keys(sharedRegionMembership(state.regionIds)).length;
  const insights = deriveSelectionInsights({
    state,
    datasetRecords: scopeRecords,
    scopeRecords: scoped,
    displayRecords,
  });
  const insightValues = (values: Record<string, string | number>) => ({
    ...values,
    ...(typeof values.correlation === "string"
      ? { correlation: t(`insights.strengths.${values.correlation}`) }
      : {}),
    ...(typeof values.comparisonMetric === "string"
      ? { comparisonMetric: t(`metrics.${values.comparisonMetric}`) }
      : {}),
  });
  const storyValues = (preset: StoryPreset): Record<string, string | number> => {
    const formatStory = (value: number | null, digits = 1) => format(value, digits);
    if (preset.storyDataKey === "europePricePeak") {
      const countries = storyAnalysis.europePricePeak.countries as StoryCountry[];
      return {
        italyHousehold: formatStory(storyCountry(countries, "ITA").householdPriceUsdPerKwh, 3),
        italyBusiness: formatStory(storyCountry(countries, "ITA").businessPriceUsdPerKwh, 3),
        germanyHousehold: formatStory(storyCountry(countries, "DEU").householdPriceUsdPerKwh, 3),
        belgiumHousehold: formatStory(storyCountry(countries, "BEL").householdPriceUsdPerKwh, 3),
      };
    }
    if (preset.storyDataKey === "ethiopiaPriceStructure") {
      const countries = storyAnalysis.ethiopiaPriceStructure.countries as StoryCountry[];
      const ethiopia = storyCountry(countries, "ETH");
      const algeria = storyCountry(countries, "DZA");
      return {
        price: formatStory(ethiopia.householdPriceUsdPerKwh, 3),
        nonFossil: formatStory(ethiopia.nonFossilElectricityPct),
        hydro: formatStory(ethiopia.hydroElectricityPct),
        algeriaNonFossil: formatStory(algeria.nonFossilElectricityPct),
      };
    }
    if (preset.storyDataKey === "chinaUsConsumption") {
      const story = storyAnalysis.chinaUsConsumption;
      return {
        total: formatStory(story.reportedConsumptionTotalEj),
        china: formatStory(story.chinaSharePct),
        unitedStates: formatStory(story.unitedStatesSharePct),
        combined: formatStory(story.combinedSharePct),
        topFive: formatStory(story.topFiveSharePct),
      };
    }
    const countries = storyAnalysis.energyBalanceSplit.countries as StoryCountry[];
    return {
      china: formatStory(storyCountry(countries, "CHN").energyBalanceGapEj),
      india: formatStory(storyCountry(countries, "IND").energyBalanceGapEj),
      russia: formatStory(storyCountry(countries, "RUS").energyBalanceGapEj),
      unitedStates: formatStory(storyCountry(countries, "USA").energyBalanceGapEj),
    };
  };
  const coverageText = (insight: (typeof insights)[number]) => {
    const { complete, total, entityKind, basis } = insight.coverage;
    const percent = total ? (complete / total) * 100 : 0;
    return t(`insights.coverage.${basis}.${entityKind}`, {
      complete,
      total,
      percent: format(percent, 0),
      metric: t(`metrics.${state.mapMetric}`),
      audience: t(`atlas.${state.priceAudience}`),
    });
  };
  const openStory = (preset: StoryPreset) => {
    setState((current) => applyStoryPreset(current, preset));
    setStoryAnnouncement(t(`stories.items.${preset.id}.announcement`));
    window.requestAnimationFrame(() => {
      document.getElementById("map")?.scrollIntoView({
        behavior:
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
          window.matchMedia("(max-width: 750px)").matches
            ? "instant"
            : "smooth",
        block: "start",
      });
    });
  };

  const setDataset = (datasetScope: DashboardState["datasetScope"]) =>
    setState((current) => reconcileState(current, records, datasetScope));
  const setSelectionMode = (selectionMode: DashboardState["selectionMode"]) =>
    setState((current) => {
      const countryCodes =
        selectionMode === "regions"
          ? countriesForRegions(
              current.regionIds.length ? current.regionIds : ["global"],
              scopeRecords.map((record) => record.iso3),
            )
          : current.countryCodes;
      return {
        ...current,
        selectionMode,
        countryCodes,
        focusCountryCodes: topFocusCountries(
          scopeRecords,
          countryCodes,
          current.focusCountryCodes,
        ),
      };
    });
  const toggleRegion = (id: string) =>
    setState((current) => {
      const regionIds = normalizeRegionSelection(
        id === "global"
          ? ["global"]
          : current.regionIds.includes(id)
            ? current.regionIds.filter((item) => item !== id)
            : [...current.regionIds.filter((item) => item !== "global"), id],
      );
      const countryCodes = countriesForRegions(
        regionIds,
        scopeRecords.map((record) => record.iso3),
      );
      return {
        ...current,
        regionIds,
        countryCodes,
        focusCountryCodes: topFocusCountries(
          scopeRecords,
          countryCodes,
          current.focusCountryCodes,
        ),
      };
    });
  const toggleCountry = (code: string) =>
    setState((current) => {
      const countryCodes = current.countryCodes.includes(code)
        ? current.countryCodes.filter((item) => item !== code)
        : [...current.countryCodes, code];
      return {
        ...current,
        countryCodes,
        focusCountryCodes: topFocusCountries(
          scopeRecords,
          countryCodes,
          current.focusCountryCodes.filter((item) => item !== code),
        ),
      };
    });
  const focusCountry = (code: string) =>
    setState((current) => {
      const countryCodes = current.countryCodes.includes(code)
        ? current.countryCodes
        : [...current.countryCodes, code];
      const focusCountryCodes = current.focusCountryCodes.includes(code)
        ? current.focusCountryCodes
        : [...current.focusCountryCodes.slice(0, 7), code];
      return {
        ...current,
        selectionMode: current.countryCodes.includes(code)
          ? current.selectionMode
          : "countries",
        countryCodes,
        focusCountryCodes,
      };
    });
  const toggleFocus = (code: string) =>
    update({
      focusCountryCodes: state.focusCountryCodes.includes(code)
        ? state.focusCountryCodes.filter((item) => item !== code)
        : [...state.focusCountryCodes.slice(0, 7), code],
    });
  const refreshViews = () =>
    suppliedRecords
      ? Promise.resolve()
      : fetchSavedViews(userId).then(setSavedViews);
  const saveView = async () => {
    try {
      await createSavedView(userId, viewName, state);
      setViewName("");
      await refreshViews();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  if (loading)
    return (
      <main id="main-content" className="loading-screen">
        <div className="loader" />
        <p>{t("atlas.loading")}</p>
      </main>
    );
  if (error && !records.length)
    return (
      <main id="main-content" className="error-screen">
        <h1>{t("atlas.loadError")}</h1>
        <p>{error}</p>
        <a href="/login">{t("auth.login")}</a>
      </main>
    );
  return (
    <div className="atlas-page" id="atlas-top">
      <header className="atlas-header">
        <a className="brand" href="#atlas-top">
          <span className="brand-mark">GE</span>
          <span>{t("brand")}</span>
        </a>
        <AtlasNavigation isGuest={isGuest} />
        <div className="header-actions">
          <PreferenceControls
            variant="navigation"
            locale={locale}
            theme={state.theme}
            onLocale={(value) => update({ locale: value })}
            onTheme={(value) => update({ theme: value })}
          />
          <div className="account-wrap">
            <button
              className="account-button"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <span className="status-dot" />
              <span className="account-label">
                {isGuest ? t("atlas.guest") : (email ?? t("atlas.account"))}
              </span>
            </button>
            {accountOpen && (
              <div className="account-menu">
                {isGuest && <p>{t("atlas.guestMenuHelp")}</p>}
                <button onClick={onSignOut}>
                  {isGuest ? t("nav.signIn") : t("atlas.signOut")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <FilterRail
        state={state}
        scopeRecords={scopeRecords}
        scopedRecords={scoped}
        availableRegions={availableRegions}
        overlapCount={overlaps}
        formatConsumption={(value) => format(value)}
        countryName={(record) => localizedCountry(record, locale)}
        onDataset={setDataset}
        onSelectionMode={setSelectionMode}
        onRegion={toggleRegion}
        onCountry={toggleCountry}
        onFocus={toggleFocus}
        onUpdate={update}
      />
      <main id="main-content" className="atlas-main" tabIndex={-1}>
        <section className="atlas-intro hero-intro">
          <img src={heroImage} alt="" />
          <div className="hero-overlay" />
          <div className="hero-copy">
            <p className="eyebrow">{t("atlas.heroEyebrow")}</p>
            <h1>{t("atlas.title")}</h1>
            <p>{t("atlas.subtitle")}</p>
            <div className="hero-filter-action">
              <a
                className="hero-filter-link primary"
                href="#scope"
                onClick={openFilterRail}
              >
                <svg
                  className="filter-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                {t("filters.open")}
              </a>
              <span>{t("filters.summary")}</span>
            </div>
          </div>
        </section>
        <section className="stories-section" id="stories" aria-labelledby="stories-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("stories.eyebrow")}</p>
              <h2 id="stories-title">{t("stories.title")}</h2>
            </div>
            <p>{t("stories.intro")}</p>
          </div>
          <div className="story-grid">
            {storyPresets.map((preset) => {
              const active = matchesStoryPreset(state, preset);
              const values = storyValues(preset);
              return (
                <article
                  key={preset.id}
                  className={`story-card${active ? " is-active" : ""}`}
                  data-testid={`story-${preset.id}`}
                >
                  <div className="story-card-heading">
                    <span>{t(`stories.items.${preset.id}.number`)}</span>
                    {active && <strong>{t("stories.active")}</strong>}
                  </div>
                  <h3>{t(`stories.items.${preset.id}.title`)}</h3>
                  <div className="story-copy">
                    <p className="story-label">{t("stories.atlasEvidence")}</p>
                    <p>{t(`stories.items.${preset.id}.evidence`, values)}</p>
                    <p className="story-label">{t("stories.marketContext")}</p>
                    <p>{t(`stories.items.${preset.id}.context`)}</p>
                    <p className="story-meaning">
                      <strong>{t("stories.managementMeaning")}</strong>{" "}
                      {t(`stories.items.${preset.id}.meaning`)}
                    </p>
                  </div>
                  <div className="story-sources">
                    {storySourceIds[preset.id].map((sourceId) => {
                      const source = contextSourceById.get(sourceId);
                      return source ? (
                        <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">
                          {t(`stories.sources.${sourceId}`)}
                        </a>
                      ) : null;
                    })}
                  </div>
                  <button
                    className="story-open primary"
                    type="button"
                    aria-pressed={active}
                    onClick={() => openStory(preset)}
                  >
                    {active ? t("stories.opened") : t("stories.open")}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {storyAnnouncement}
          </p>
        </section>
        <WorldMap
          records={scopeRecords}
          scopeCodes={state.countryCodes}
          focusCodes={state.focusCountryCodes}
          state={state}
          onCountry={focusCountry}
        />
        <section className="summary-section" id="signals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("insights.eyebrow")}</p>
              <h2>{t("insights.title")}</h2>
            </div>
            <p>{t("insights.intro")}</p>
          </div>
          <div className="insight-grid">
            {insights.map((insight) => (
              <article
                key={insight.id}
                className={`insight-card tone-${insight.tone}`}
                data-testid={`insight-${insight.id}`}
              >
                <div className="insight-meta">
                  <span>{t(`insights.categories.${insight.category}`)}</span>
                  <small>{coverageText(insight)}</small>
                </div>
                <h3>{t(insight.titleKey)}</h3>
                <p>{t(insight.bodyKey, insightValues(insight.values))}</p>
                <strong>{t("insights.next")}</strong>
              </article>
            ))}
          </div>
          <div className="kpi-grid">
            <article>
              <span>{t("atlas.medianPrice")}</span>
              <strong>{format(medianPrice, 3)}</strong>
              <small>
                USD/kWh · {displayPriceValues.length}/{displayRecords.length}
              </small>
            </article>
            <article>
              <span>{t("atlas.consumption")}</span>
              <strong>{format(totalConsumption)}</strong>
              <small>EJ</small>
            </article>
            <article>
              <span>{t("atlas.nonFossil")}</span>
              <strong>{format(weightedNonFossil)}</strong>
              <small>% · {t("atlas.generationWeighted")}</small>
            </article>
            <article>
              <span>
                {state.datasetScope === "assignment-15"
                  ? t("atlas.netImports")
                  : t("atlas.trade")}
              </span>
              <strong>
                {totalTrade > 0 ? "+" : ""}
                {format(totalTrade)}
              </strong>
              <small>EJ</small>
            </article>
          </div>
        </section>
        {displayRecords.length > 0 && (
          <>
            <section className="chart-grid" id="charts">
              <article className="chart-card">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">COST × MIX</p>
                    <h2>
                      {t("metrics.price")} / {t("metrics.nonFossil")}
                    </h2>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <ScatterChart
                    margin={{ top: 15, right: 20, bottom: 25, left: 5 }}
                  >
                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      strokeDasharray="3 3"
                    />
                    <XAxis type="number" dataKey="price" unit=" $" />
                    <YAxis
                      type="number"
                      dataKey="nonFossil"
                      unit="%"
                      domain={[0, 100]}
                    />
                    <ZAxis type="number" dataKey="size" range={[90, 700]} />
                    {datasetPriceMedian !== null && (
                      <ReferenceLine
                        x={datasetPriceMedian}
                        stroke="var(--brand)"
                        strokeDasharray="5 4"
                      />
                    )}
                    {datasetMixMedian !== null && (
                      <ReferenceLine
                        y={datasetMixMedian}
                        stroke="var(--focus)"
                        strokeDasharray="5 4"
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        borderColor: "var(--line)",
                        color: "var(--ink)",
                      }}
                    />
                    <Scatter
                      data={displayRecords.map((record) => ({
                        name: localizedCountry(record, locale).replace(
                          "regions.",
                          "",
                        ),
                        price: metricValue(
                          record,
                          "price",
                          state.priceAudience,
                        ),
                        nonFossil: nonFossil(record),
                        size: Math.max(1, record.consumption.value ?? 1),
                      }))}
                    >
                      {displayRecords.map((record, index) => (
                        <Cell
                          key={record.iso3}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="chart-explanation">
                  {t("charts.costMix", {
                    price: format(datasetPriceMedian, 3),
                    mix: format(datasetMixMedian),
                  })}
                </p>
              </article>
              <article className="chart-card">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">GENERATION</p>
                    <h2>{t("charts.generationTitle")}</h2>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={displayRecords.map((record) => ({
                      name: record.iso3.startsWith("R-")
                        ? t(record.country)
                        : localizedCountry(record, locale),
                      ...normalizeElectricityMix(record.electricity),
                    }))}
                    layout="vertical"
                    margin={{ left: 15, right: 15 }}
                  >
                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      ticks={electricityMixTicks}
                      tickFormatter={(value) =>
                        formatPercentTick(Number(value))
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${new Intl.NumberFormat(locale, {
                          maximumFractionDigits: 1,
                        }).format(Number(value))}%`,
                      ]}
                      contentStyle={{
                        background: "var(--surface)",
                        borderColor: "var(--line)",
                        color: "var(--ink)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="solar" stackId="mix" fill={mixColors.solar} />
                    <Bar dataKey="wind" stackId="mix" fill={mixColors.wind} />
                    <Bar dataKey="hydro" stackId="mix" fill={mixColors.hydro} />
                    <Bar dataKey="other" stackId="mix" fill={mixColors.other} />
                    <Bar dataKey="gas" stackId="mix" fill={mixColors.gas} />
                    <Bar dataKey="coal" stackId="mix" fill={mixColors.coal} />
                    <Bar
                      dataKey="oilAndOtherFossil"
                      stackId="mix"
                      fill={mixColors.oilAndOtherFossil}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="chart-explanation">{t("charts.generation")}</p>
              </article>
            </section>
            <section className="balance-chart">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">BALANCE</p>
                  <h2>
                    {state.datasetScope === "assignment-15"
                      ? t("atlas.netImports")
                      : t("atlas.trade")}
                  </h2>
                </div>
              </div>
              <ResponsiveContainer
                width="100%"
                height={Math.max(260, displayRecords.length * 42)}
              >
                <BarChart
                  data={displayRecords.map((record) => ({
                    name: record.iso3.startsWith("R-")
                      ? t(record.country)
                      : localizedCountry(record, locale),
                    value: record.tradeExposure.value,
                  }))}
                  layout="vertical"
                  margin={{ left: 35, right: 30 }}
                >
                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    horizontal={false}
                  />
                  <XAxis type="number" unit=" EJ" />
                  <YAxis type="category" dataKey="name" width={110} />
                  <ReferenceLine x={0} stroke="var(--ink)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      borderColor: "var(--line)",
                      color: "var(--ink)",
                    }}
                  />
                  <Bar dataKey="value">
                    {displayRecords.map((record) => (
                      <Cell
                        key={record.iso3}
                        fill={
                          (record.tradeExposure.value ?? 0) >= 0
                            ? "var(--map-import)"
                            : "var(--map-export)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="chart-explanation">
                {t(
                  state.datasetScope === "assignment-15"
                    ? "charts.balanceAssignment"
                    : "charts.balanceExpanded",
                )}
              </p>
            </section>
          </>
        )}
        <section className="table-section" id="evidence">
          <div className="table-heading">
            <div>
              <p className="eyebrow">EVIDENCE TABLE</p>
              <h2>{t("atlas.details")}</h2>
            </div>
            <div>
              <label>
                {t("atlas.sort")}
                <select
                  value={state.sortMetric}
                  onChange={(event) =>
                    update({
                      sortMetric: event.target
                        .value as DashboardState["sortMetric"],
                    })
                  }
                >
                  {(
                    [
                      "price",
                      "consumption",
                      "nonFossil",
                      "tradeExposure",
                    ] as const
                  ).map((metric) => (
                    <option key={metric} value={metric}>
                      {t(`metrics.${metric}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                onClick={() => downloadCsv(sorted, state)}
              >
                {t("atlas.download")}
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("table.market")}</th>
                  <th>{t("table.price")}</th>
                  <th>{t("table.consumption")}</th>
                  <th>{t("table.nonFossil")}</th>
                  <th>{t("table.tradeExposure")}</th>
                  <th>{t("table.period")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((record) => {
                  const price =
                    state.priceAudience === "household"
                      ? record.householdPrice
                      : record.businessPrice;
                  return (
                    <tr key={record.iso3}>
                      <th scope="row">
                        {record.iso3.startsWith("R-")
                          ? t(record.country)
                          : localizedCountry(record, locale)}
                        {record.iso3.startsWith("R-") && (
                          <small>
                            {(record as AggregateRecord).priceCoverage}/
                            {(record as AggregateRecord).memberCount}
                          </small>
                        )}
                      </th>
                      <td>
                        {format(price.value, 3)}
                        <small>USD/kWh</small>
                      </td>
                      <td>
                        {format(record.consumption.value)}
                        <small>EJ</small>
                      </td>
                      <td>
                        {format(nonFossil(record))}
                        <small>%</small>
                      </td>
                      <td>
                        {record.tradeExposure.value &&
                        record.tradeExposure.value > 0
                          ? "+"
                          : ""}
                        {format(record.tradeExposure.value)}
                        <small>EJ</small>
                      </td>
                      <td>
                        {price.period}
                        <small>
                          {price.isFallback && t("common.fallback")}
                        </small>
                        <br />
                        {record.consumption.period}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        {!isGuest && (
          <section className="saved-section" id="saved-views">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PERSONAL</p>
                <h2>{t("atlas.savedViews")}</h2>
              </div>
            </div>
            <div className="save-form">
              <label>
                {t("atlas.viewName")}
                <input
                  maxLength={80}
                  value={viewName}
                  onChange={(event) => setViewName(event.target.value)}
                />
              </label>
              <button
                className="primary"
                disabled={!viewName.trim() || savedViews.length >= 25}
                onClick={saveView}
              >
                {t("atlas.saveView")}
              </button>
            </div>
            <div className="saved-list">
              {savedViews.map((view) => (
                <article key={view.id}>
                  <div>
                    <strong>{view.name}</strong>
                    <small>
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                      }).format(new Date(view.updatedAt))}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      setState(reconcileState(view.state, records))
                    }
                  >
                    {t("atlas.load")}
                  </button>
                  <button
                    onClick={async () => {
                      const name = window.prompt(
                        t("atlas.viewName"),
                        view.name,
                      );
                      if (name) {
                        await renameSavedView(view.id, name);
                        await refreshViews();
                      }
                    }}
                  >
                    {t("atlas.rename")}
                  </button>
                  <button
                    onClick={async () => {
                      await deleteSavedView(view.id);
                      await refreshViews();
                    }}
                  >
                    {t("atlas.delete")}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className="methodology" id="methodology">
          <div className="section-heading">
            <div>
              <p className="eyebrow">METHOD</p>
              <h2>{t("atlas.method")}</h2>
            </div>
          </div>
          <div className="method-grid">
            <article id="dataset-scopes">
              <span>01</span>
              <p>
                {state.datasetScope === "assignment-15"
                  ? t("methodology.assignment")
                  : t("methodology.expanded")}
              </p>
            </article>
            <article>
              <span>02</span>
              <p>{t("methodology.missing")}</p>
            </article>
            <article id="provenance">
              <span>03</span>
              <p>{t("methodology.dates")}</p>
            </article>
          </div>
          <div className="evidence-boundaries" id="evidence-boundaries">
            <div className="evidence-boundaries-heading">
              <p className="eyebrow">{t("evidenceBoundaries.eyebrow")}</p>
              <h3>{t("evidenceBoundaries.title")}</h3>
              <p>{t("evidenceBoundaries.intro")}</p>
            </div>
            <div className="evidence-boundary-grid">
              {evidenceBoundaryLevels.map((level, index) => (
                <article
                  key={level}
                  data-boundary-level={level}
                  data-boundary-status={analysisSummary.evidenceBoundaries[level].status}
                >
                  <span>0{index + 1}</span>
                  <div className="boundary-title-row">
                    <h4>{t(`evidenceBoundaries.${level}.title`)}</h4>
                    <strong>{t(`evidenceBoundaries.${level}.status`)}</strong>
                  </div>
                  <p><b>{t("evidenceBoundaries.supportsLabel")}</b> {t(`evidenceBoundaries.${level}.supports`)}</p>
                  <p><b>{t("evidenceBoundaries.doesNotProveLabel")}</b> {t(`evidenceBoundaries.${level}.doesNotProve`)}</p>
                  <p><b>{t("evidenceBoundaries.nextLabel")}</b> {t(`evidenceBoundaries.${level}.nextWork`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        {error && (
          <div className="toast" role="status">
            {error}
            <button onClick={() => setError("")}>{t("common.close")}</button>
          </div>
        )}
      </main>
      <footer className="atlas-footer">
        <span>{t("brand")}</span>
        <p>
          © {new Date().getFullYear()} Zhekai Li ·{" "}
          {isGuest ? t("atlas.guestFooter") : t("atlas.accountFooter")}
        </p>
        <a href="#atlas-top">↑ {t("nav.atlas")}</a>
      </footer>
    </div>
  );
}
