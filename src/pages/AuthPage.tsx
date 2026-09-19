import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { PreferenceControls } from '../components/PreferenceControls'
import { isGoogleAuthEnabled, supabase } from '../lib/supabase'
import type { Locale, ThemePreference } from '../types'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

export function AuthPage({ mode, locale, theme, onLocale, onTheme, successPath, onNavigate, onContinueAsGuest }: { mode: AuthMode; locale: Locale; theme: ThemePreference; onLocale: (value: Locale) => void; onTheme: (value: ThemePreference) => void; successPath: string; onNavigate: (path: string) => void; onContinueAsGuest: () => void }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const title = t(`auth.${mode === 'forgot-password' ? 'forgot' : mode === 'reset-password' ? 'reset' : mode}`)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setMessage('')
    if (!supabase) { setMessage(t('auth.configured')); return }
    if ((mode === 'register' || mode === 'reset-password') && password !== confirm) { setMessage('Passwords do not match.'); return }
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error
        onNavigate(successPath)
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${successPath}` } }); if (error) throw error
        if (data.session) onNavigate(successPath); else setMessage(t('auth.checkEmail'))
      } else if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error
        setMessage(t('auth.checkEmail'))
      } else {
        const { error } = await supabase.auth.updateUser({ password }); if (error) throw error
        onNavigate(successPath)
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) } finally { setBusy(false) }
  }
  const google = async () => {
    if (!supabase) { setMessage(t('auth.configured')); return }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}${successPath}` } })
    if (error) setMessage(error.message)
  }
  return <div className="auth-page">
    <header className="public-header"><a className="brand" href="/"><span className="brand-mark">GE</span><span>{t('brand')}</span></a><PreferenceControls {...{ locale, theme, onLocale, onTheme }} /></header>
    <main id="main-content" className="auth-main" tabIndex={-1}><section className="auth-panel"><a href="/" className="back-link">← {t('auth.back')}</a><p className="eyebrow">Secure workspace</p><h1>{title}</h1>
      {!supabase && <div className="notice" role="status">{t('auth.configured')}</div>}
      <form onSubmit={submit}>
        {mode !== 'reset-password' && <label>{t('auth.email')}<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
        {mode !== 'forgot-password' && <label>{t('auth.password')}<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>}
        {(mode === 'register' || mode === 'reset-password') && <label>{t('auth.confirmPassword')}<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>}
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="primary wide" disabled={busy}>{busy ? '…' : t(mode === 'login' ? 'auth.submitLogin' : mode === 'register' ? 'auth.submitRegister' : mode === 'forgot-password' ? 'auth.sendReset' : 'auth.updatePassword')}</button>
      </form>
      {isGoogleAuthEnabled && (mode === 'login' || mode === 'register') && <><div className="or"><span>or</span></div><button className="secondary wide" type="button" onClick={google}>{t('auth.google')}</button></>}
      {mode === 'login' && <section className="guest-access" aria-labelledby="guest-access-title"><strong id="guest-access-title">{t('auth.guestTitle')}</strong><p>{t('auth.guestExplanation')}</p><button className="secondary wide" type="button" onClick={onContinueAsGuest}>{t('auth.continueGuest')}</button></section>}
      <div className="auth-links">{mode === 'login' && <><a href="/register">{t('auth.noAccount')} {t('auth.register')}</a><a href="/forgot-password">{t('auth.forgot')}</a></>}{mode === 'register' && <a href="/login">{t('auth.haveAccount')} {t('auth.login')}</a>}{(mode === 'forgot-password' || mode === 'reset-password') && <a href="/login">{t('auth.login')}</a>}</div>
    </section><aside className="auth-aside"><span>GLOBAL ENERGY / 50 MARKETS</span><p>“Context is the difference between a number and a decision.”</p><small>© {new Date().getFullYear()} Zhekai Li</small></aside></main>
  </div>
}
