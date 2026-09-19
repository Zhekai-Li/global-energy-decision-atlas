import { useTranslation } from "react-i18next";
import { HeaderDropdown } from "./HeaderDropdown";
import { openFilterRail } from "../filter-rail-events";

export function AtlasNavigation({ isGuest = false }: { isGuest?: boolean }) {
  const { t } = useTranslation();

  return (
    <nav className="atlas-nav" aria-label={t("nav.dashboard")}>
      <a className="atlas-nav-link" href="#atlas-top">
        {t("nav.atlas")}
      </a>
      <HeaderDropdown id="explore" label={t("nav.explore")}>
        {(close) => (
          <>
            <a href="#map" onClick={close}>
              {t("nav.map")}
            </a>
            <a href="#signals" onClick={close}>
              {t("nav.signals")}
            </a>
            <a href="#charts" onClick={close}>
              {t("nav.charts")}
            </a>
          </>
        )}
      </HeaderDropdown>
      <HeaderDropdown id="analysis" label={t("nav.analysis")}>
        {(close) => (
          <>
            <a
              href="#scope"
              onClick={() => {
                close();
                openFilterRail();
              }}
            >
              {t("nav.scope")}
            </a>
            <a href="#evidence" onClick={close}>
              {t("nav.evidence")}
            </a>
            {!isGuest && (
              <a href="#saved-views" onClick={close}>
                {t("nav.savedViews")}
              </a>
            )}
          </>
        )}
      </HeaderDropdown>
      <HeaderDropdown id="resources" label={t("nav.resources")} wide>
        {(close) => (
          <>
            <a href="#methodology" onClick={close}>
              {t("nav.methodology")}
            </a>
            <a href="#evidence-boundaries" onClick={close}>
              {t("nav.evidenceBoundaries")}
            </a>
            <div className="nav-menu-group">
              <span>{t("nav.dataDefinitions")}</span>
              <a href="#dataset-scopes" onClick={close}>
                {t("nav.datasetScopes")}
              </a>
              <a href="#provenance" onClick={close}>
                {t("nav.provenance")}
              </a>
            </div>
          </>
        )}
      </HeaderDropdown>
      <a className="atlas-nav-link" href="/deliverables">
        {t("nav.deliverables")}
      </a>
    </nav>
  );
}
