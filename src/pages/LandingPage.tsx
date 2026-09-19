import { useTranslation } from 'react-i18next'
import type { Locale, ThemePreference } from '../types'
import { PreferenceControls } from '../components/PreferenceControls'

export function LandingPage({ locale, theme, onLocale, onTheme }: { locale: Locale; theme: ThemePreference; onLocale: (value: Locale) => void; onTheme: (value: ThemePreference) => void }) {
  const { t } = useTranslation()
  return <div className="public-page">
    <header className="public-header"><a className="brand" href="/"><span className="brand-mark">GE</span><span>{t('brand')}</span></a><div><PreferenceControls {...{ locale, theme, onLocale, onTheme }} /><a className="text-link" href="/deliverables">{t('nav.deliverables')}</a><a className="text-link" href="/login">{t('nav.signIn')}</a></div></header>
    <main id="main-content" className="landing-main" tabIndex={-1}>
      <section className="landing-copy"><p className="eyebrow">{t('landing.eyebrow')}</p><h1>{t('landing.title')}</h1><p>{t('landing.copy')}</p><div className="landing-actions"><a className="primary" href="/login">{t('landing.cta')} <span aria-hidden="true">↗</span></a><a className="secondary-link" href="/deliverables">{t('landing.deliverablesCta')}</a><small>{t('landing.privacy')}</small></div></section>
      <aside className="landing-preview" aria-label="Atlas preview"><div className="preview-orbit orbit-one"/><div className="preview-orbit orbit-two"/><div className="preview-card preview-a"><span>50</span><small>MARKETS</small></div><div className="preview-card preview-b"><span>4</span><small>REGIONS</small></div><div className="preview-line"/><p>PRICE · MIX · SCALE · BALANCE</p></aside>
    </main>
    <footer><span>{t('brand')}</span><p>© {new Date().getFullYear()} Zhekai Li · {t('landing.footer')}</p></footer>
  </div>
}
