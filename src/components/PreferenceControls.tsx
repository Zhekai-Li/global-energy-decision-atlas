import { useTranslation } from 'react-i18next'
import { locales } from '../i18n'
import type { Locale, ThemePreference } from '../types'
import { HeaderDropdown } from './HeaderDropdown'

export function PreferenceControls({ locale, theme, onLocale, onTheme, variant = 'select' }: { locale: Locale; theme: ThemePreference; onLocale: (locale: Locale) => void; onTheme: (theme: ThemePreference) => void; variant?: 'select' | 'navigation' }) {
  const { t } = useTranslation()

  if (variant === 'navigation') return <div className="preference-controls preference-navigation">
    <HeaderDropdown id="language" label={t('language')} wide>
      {(close) => locales.map((item) => <button className="preference-option" type="button" key={item.code} aria-pressed={locale === item.code} onClick={() => { onLocale(item.code); close() }}>{item.label}</button>)}
    </HeaderDropdown>
    <HeaderDropdown id="theme" label={t('theme.label')}>
      {(close) => (['system', 'light', 'dark'] as const).map((item) => <button className="preference-option" type="button" key={item} aria-pressed={theme === item} onClick={() => { onTheme(item); close() }}>{t(`theme.${item}`)}</button>)}
    </HeaderDropdown>
  </div>

  return <div className="preference-controls">
    <label><span>{t('language')}</span><select aria-label={t('language')} value={locale} onChange={(event) => onLocale(event.target.value as Locale)}>{locales.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
    <label><span>{t('theme.label')}</span><select aria-label={t('theme.label')} value={theme} onChange={(event) => onTheme(event.target.value as ThemePreference)}><option value="system">{t('theme.system')}</option><option value="light">{t('theme.light')}</option><option value="dark">{t('theme.dark')}</option></select></label>
  </div>
}
