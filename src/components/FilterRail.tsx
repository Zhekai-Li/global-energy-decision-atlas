import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AtlasRecord, DashboardState } from "../types";
import type { RegionDefinition } from "../regions";
import { openFiltersEvent } from "../filter-rail-events";

const metrics = ["price", "nonFossil", "consumption", "tradeExposure"] as const;

export function FilterRail({
  state,
  scopeRecords,
  scopedRecords,
  availableRegions,
  overlapCount,
  formatConsumption,
  countryName,
  onDataset,
  onSelectionMode,
  onRegion,
  onCountry,
  onFocus,
  onUpdate,
}: {
  state: DashboardState;
  scopeRecords: AtlasRecord[];
  scopedRecords: AtlasRecord[];
  availableRegions: RegionDefinition[];
  overlapCount: number;
  formatConsumption: (value: number | null) => string;
  countryName: (record: AtlasRecord) => string;
  onDataset: (scope: DashboardState["datasetScope"]) => void;
  onSelectionMode: (mode: DashboardState["selectionMode"]) => void;
  onRegion: (id: string) => void;
  onCountry: (code: string) => void;
  onFocus: (code: string) => void;
  onUpdate: (patch: Partial<DashboardState>) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLElement>(null);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    if (!pinned)
      closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && !pinned) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelClose();
    };
  }, [open, pinned]);

  useEffect(() => {
    const openAndFocus = () => {
      cancelClose();
      setOpen(true);
      window.setTimeout(() => {
        railRef.current
          ?.querySelector<HTMLElement>(
            ".rail-section button:not(:disabled), .rail-section select:not(:disabled), .rail-section input:not(:disabled)",
          )
          ?.focus();
      }, 0);
    };
    const handleHash = () => {
      if (window.location.hash === "#scope") openAndFocus();
    };
    window.addEventListener(openFiltersEvent, openAndFocus);
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => {
      window.removeEventListener(openFiltersEvent, openAndFocus);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        className="mobile-filter-trigger"
        aria-expanded={open}
        aria-controls="scope"
        onClick={() => setOpen(true)}
      >
        <svg className="filter-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        {t("filters.open")}
      </button>
      {open && (
        <button
          className="filter-scrim"
          aria-label={t("filters.close")}
          onClick={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
      <aside
        ref={railRef}
        id="scope"
        className={`filter-rail${open || pinned ? " is-open" : ""}${pinned ? " is-pinned" : ""}`}
        aria-label={t("filters.title")}
        onMouseEnter={() => {
          if (!window.matchMedia("(hover: none)").matches) {
            cancelClose();
            setOpen(true);
          }
        }}
        onMouseLeave={scheduleClose}
        onFocusCapture={() => {
          cancelClose();
          setOpen(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            scheduleClose();
        }}
      >
        {!(open || pinned) && (
          <div className="rail-collapsed" aria-hidden="true">
            <svg className="filter-icon" viewBox="0 0 24 24">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <b>{t("filters.short")}</b>
          </div>
        )}
        <div className="rail-content">
          <div className="rail-heading">
            <div>
              <p className="eyebrow">{t("filters.eyebrow")}</p>
              <h2>{t("filters.title")}</h2>
            </div>
            <div className="rail-heading-actions">
              <button
                className="rail-pin"
                aria-pressed={pinned}
                onClick={() => {
                  setPinned(!pinned);
                  setOpen(true);
                }}
              >
                {pinned ? t("filters.unpin") : t("filters.pin")}
              </button>
              <button
                className="rail-close"
                aria-label={t("filters.close")}
                onClick={() => {
                  setPinned(false);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                ×
              </button>
            </div>
          </div>

          <section
            className="rail-section"
            aria-labelledby="rail-controls-title"
          >
            <h3 id="rail-controls-title">{t("filters.controls")}</h3>
            <div
              className="filter-control"
              role="group"
              aria-label={t("atlas.dataScope")}
            >
              <span className="control-label">{t("atlas.dataScope")}</span>
              <div className="segmented">
                <button
                  className={
                    state.datasetScope === "assignment-15" ? "active" : ""
                  }
                  onClick={() => onDataset("assignment-15")}
                >
                  {t("atlas.assignment")}
                </button>
                <button
                  className={
                    state.datasetScope === "expanded-50" ? "active" : ""
                  }
                  onClick={() => onDataset("expanded-50")}
                >
                  {t("atlas.expanded")}
                </button>
              </div>
              <span className="control-help">{t("atlas.datasetHelp")}</span>
            </div>
            <div
              className="filter-control"
              role="group"
              aria-label={t("atlas.scope")}
            >
              <span className="control-label">{t("atlas.scope")}</span>
              <div className="segmented">
                <button
                  className={
                    state.selectionMode === "countries" ? "active" : ""
                  }
                  onClick={() => onSelectionMode("countries")}
                >
                  {t("atlas.countryMode")}
                </button>
                <button
                  className={state.selectionMode === "regions" ? "active" : ""}
                  onClick={() => onSelectionMode("regions")}
                >
                  {t("atlas.regionMode")}
                </button>
              </div>
              <span className="control-help">{t("atlas.scopeHelp")}</span>
            </div>
            <div
              className="filter-control"
              role="group"
              aria-label={t("atlas.display")}
            >
              <span className="control-label">{t("atlas.display")}</span>
              <div className="segmented">
                <button
                  disabled={state.selectionMode !== "regions"}
                  className={
                    state.selectionMode === "regions" &&
                    state.regionDisplayMode === "members"
                      ? "active"
                      : ""
                  }
                  onClick={() => onUpdate({ regionDisplayMode: "members" })}
                >
                  {t("atlas.members")}
                </button>
                <button
                  disabled={state.selectionMode !== "regions"}
                  className={
                    state.selectionMode === "regions" &&
                    state.regionDisplayMode === "aggregate"
                      ? "active"
                      : ""
                  }
                  onClick={() => onUpdate({ regionDisplayMode: "aggregate" })}
                >
                  {t("atlas.aggregate")}
                </button>
              </div>
              <span className="control-help">
                {t(
                  state.selectionMode === "regions"
                    ? "atlas.displayHelp"
                    : "atlas.displayCountriesHelp",
                )}
              </span>
            </div>
            <label className="filter-control">
              <span className="control-label">{t("atlas.audience")}</span>
              <select
                aria-label={t("atlas.audience")}
                value={state.priceAudience}
                onChange={(event) =>
                  onUpdate({
                    priceAudience: event.target
                      .value as DashboardState["priceAudience"],
                  })
                }
              >
                <option value="household">{t("atlas.household")}</option>
                <option value="business">{t("atlas.business")}</option>
              </select>
              <span className="control-help">
                {t(`atlas.${state.priceAudience}Help`)}
              </span>
            </label>
          </section>

          <section className="rail-section" aria-labelledby="rail-metric-title">
            <h3 id="rail-metric-title">{t("filters.metric")}</h3>
            <label className="filter-control">
              <span className="control-label">{t("atlas.mapMetric")}</span>
              <select
                aria-label={t("atlas.mapMetric")}
                value={state.mapMetric}
                onChange={(event) =>
                  onUpdate({
                    mapMetric: event.target
                      .value as DashboardState["mapMetric"],
                  })
                }
              >
                {metrics.map((metric) => (
                  <option key={metric} value={metric}>
                    {t(`metrics.${metric}`)}
                  </option>
                ))}
              </select>
            </label>
            <details
              className="rail-metric-guide"
              role="region"
              aria-label={t("atlas.metricGuide")}
              open
            >
              <summary>{t("atlas.metricGuide")}</summary>
              {metrics.map((metric) => (
                <article
                  key={metric}
                  className={state.mapMetric === metric ? "selected" : ""}
                >
                  <div>
                    <strong>{t(`metrics.${metric}`)}</strong>
                    <span>
                      {metric === "price"
                        ? "USD/kWh"
                        : metric === "nonFossil"
                          ? "%"
                          : "EJ"}
                    </span>
                  </div>
                  <p>
                    {t(
                      `atlas.mapMetricHelp.${metric === "tradeExposure" ? (state.datasetScope === "assignment-15" ? "tradeAssignment" : "tradeExpanded") : metric}`,
                    )}
                  </p>
                </article>
              ))}
            </details>
          </section>

          <section
            className="rail-section rail-selection"
            aria-labelledby="rail-selection-title"
          >
            <h3 id="rail-selection-title">{t("filters.selection")}</h3>
            <h4>
              {state.selectionMode === "regions"
                ? t("atlas.regionMode")
                : t("atlas.countryMode")}{" "}
              <small>
                {t("atlas.selected", {
                  count:
                    state.selectionMode === "regions"
                      ? state.regionIds.length
                      : state.countryCodes.length,
                })}
              </small>
            </h4>
            <div className="chip-grid">
              {state.selectionMode === "regions"
                ? availableRegions.map((region) => (
                    <label
                      className={
                        state.regionIds.includes(region.id) ? "selected" : ""
                      }
                      key={region.id}
                    >
                      <input
                        type="checkbox"
                        checked={state.regionIds.includes(region.id)}
                        disabled={
                          !state.regionIds.includes(region.id) &&
                          state.regionIds.length >= 4
                        }
                        onChange={() => onRegion(region.id)}
                      />
                      <span>{t(region.labelKey)}</span>
                    </label>
                  ))
                : [...scopeRecords]
                    .sort((a, b) =>
                      countryName(a).localeCompare(
                        countryName(b),
                        state.locale,
                      ),
                    )
                    .map((record) => (
                      <label
                        className={
                          state.countryCodes.includes(record.iso3)
                            ? "selected"
                            : ""
                        }
                        key={record.iso3}
                      >
                        <input
                          type="checkbox"
                          checked={state.countryCodes.includes(record.iso3)}
                          onChange={() => onCountry(record.iso3)}
                        />
                        <span>{countryName(record)}</span>
                      </label>
                    ))}
            </div>
            {overlapCount > 0 && state.selectionMode === "regions" && (
              <p className="overlap-note">
                {t("atlas.overlap", { count: overlapCount })}
              </p>
            )}
            <h4>
              {t("atlas.focus")}{" "}
              <small>{state.focusCountryCodes.length}/8</small>
            </h4>
            <p className="help">{t("atlas.focusHelp")}</p>
            <div className="focus-list">
              {[...scopedRecords]
                .sort(
                  (a, b) =>
                    (b.consumption.value ?? 0) - (a.consumption.value ?? 0),
                )
                .map((record) => (
                  <button
                    key={record.iso3}
                    className={
                      state.focusCountryCodes.includes(record.iso3)
                        ? "selected"
                        : ""
                    }
                    disabled={
                      !state.focusCountryCodes.includes(record.iso3) &&
                      state.focusCountryCodes.length >= 8
                    }
                    onClick={() => onFocus(record.iso3)}
                  >
                    <span>{countryName(record)}</span>
                    <small>
                      {formatConsumption(record.consumption.value)} EJ
                    </small>
                  </button>
                ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
