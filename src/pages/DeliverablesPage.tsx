import { useTranslation } from "react-i18next";
import { Deliverables } from "../components/Deliverables";
import { PreferenceControls } from "../components/PreferenceControls";
import { courseRequirements } from "../deliverables";
import type { Locale, ThemePreference } from "../types";

export function DeliverablesPage({
  locale,
  theme,
  onLocale,
  onTheme,
}: {
  locale: Locale;
  theme: ThemePreference;
  onLocale: (value: Locale) => void;
  onTheme: (value: ThemePreference) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="public-page deliverables-page">
      <header className="public-header">
        <a className="brand" href="/">
          <span className="brand-mark">GE</span>
          <span>{t("brand")}</span>
        </a>
        <div>
          <PreferenceControls {...{ locale, theme, onLocale, onTheme }} />
          <a className="text-link" href="/atlas">
            {t("deliverables.openAtlas")}
          </a>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="deliverables-hero" aria-labelledby="deliverables-page-title">
          <p className="eyebrow">{t("deliverables.eyebrow")}</p>
          <h1 id="deliverables-page-title">{t("deliverables.publicTitle")}</h1>
          <p>{t("deliverables.publicIntro")}</p>
        </section>
        <section className="requirements-section" aria-labelledby="requirements-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("deliverables.requirementsEyebrow")}</p>
              <h2 id="requirements-title">{t("deliverables.requirementsTitle")}</h2>
            </div>
          </div>
          <ol className="requirements-list">
            {courseRequirements.map((requirement) => (
              <li key={requirement.id}>
                <span>0{requirement.number}</span>
                <div>
                  <h3>{t(`deliverables.requirements.${requirement.id}.title`)}</h3>
                  <p>{t(`deliverables.requirements.${requirement.id}.description`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <Deliverables />
      </main>
      <footer>
        <span>{t("brand")}</span>
        <p>© {new Date().getFullYear()} Zhekai Li · {t("deliverables.publicAccess")}</p>
      </footer>
    </div>
  );
}
