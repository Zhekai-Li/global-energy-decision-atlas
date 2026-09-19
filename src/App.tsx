import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './auth'
import { LandingPage } from './pages/LandingPage'
import { loadLocalState, saveLocalState } from './state'
import type { DashboardState } from './types'

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const AtlasPage = lazy(() => import('./pages/AtlasPage').then((module) => ({ default: module.AtlasPage })))
const GuestAtlasPage = lazy(() => import('./pages/GuestAtlasPage').then((module) => ({ default: module.GuestAtlasPage })))
const DeliverablesPage = lazy(() => import('./pages/DeliverablesPage').then((module) => ({ default: module.DeliverablesPage })))

const guestSessionKey = 'energy-atlas-guest-session'

function usePathname() {
  const [path, setPath] = useState(window.location.pathname)
  const [, setLocationRevision] = useState(0)
  useEffect(() => {
    const handler = () => { setPath(window.location.pathname); setLocationRevision((value) => value + 1) }
    window.addEventListener('popstate', handler); window.addEventListener('hashchange', handler)
    return () => { window.removeEventListener('popstate', handler); window.removeEventListener('hashchange', handler) }
  }, [])
  const navigate = useCallback((next: string) => { window.history.pushState({}, '', next); setPath(window.location.pathname); window.scrollTo(0,0) }, [])
  return [path, navigate] as const
}

function Redirect({ to, navigate }: { to: string; navigate: (path: string) => void }) {
  useEffect(() => navigate(to), [navigate, to])
  return <main className="loading-screen"><div className="loader"/></main>
}

function RoutedApp() {
  const { i18n } = useTranslation()
  const auth = useAuth()
  const [path, navigate] = usePathname()
  const [preferences, setPreferences] = useState<DashboardState>(() => loadLocalState())
  const [guestMode, setGuestMode] = useState(() => window.sessionStorage.getItem(guestSessionKey) === 'true')
  useEffect(() => {
    if (!auth.user) return
    window.sessionStorage.removeItem(guestSessionKey)
    setGuestMode(false)
  }, [auth.user])
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = preferences.theme === 'system' ? media.matches ? 'dark' : 'light' : preferences.theme
      document.documentElement.dataset.theme = resolved
      document.documentElement.lang = preferences.locale
      document.documentElement.dir = preferences.locale === 'ar' ? 'rtl' : 'ltr'
      void i18n.changeLanguage(preferences.locale)
    }
    apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply)
  }, [i18n, preferences.locale, preferences.theme])
  const setPrefs = (patch: Partial<DashboardState>) => setPreferences((current) => { const next = { ...current, ...patch }; saveLocalState(next); return next })
  const preferenceProps = { locale: preferences.locale, theme: preferences.theme, onLocale: (locale: DashboardState['locale']) => setPrefs({ locale }), onTheme: (theme: DashboardState['theme']) => setPrefs({ theme }) }
  const continueAsGuest = () => { window.sessionStorage.setItem(guestSessionKey, 'true'); setGuestMode(true); navigate(safeRequestedPath) }
  const leaveGuest = () => { window.sessionStorage.removeItem(guestSessionKey); setGuestMode(false); navigate('/login') }
  const updateGuestPreferences = (next: DashboardState) => {
    setPreferences(next)
    const stored = loadLocalState()
    saveLocalState({ ...stored, locale: next.locale, theme: next.theme })
  }
  const requestedPath = new URLSearchParams(window.location.search).get('next')
  const safeRequestedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/atlas'
  if (window.location.hash === '#deliverables') {
    return <Redirect to="/deliverables" navigate={navigate}/>
  }
  if (path === '/' && window.location.hash === '#methodology') {
    return <Redirect to={auth.user ? '/atlas#methodology' : `/login?next=${encodeURIComponent('/atlas#methodology')}`} navigate={navigate}/>
  }
  if (path === '/deliverables') return <DeliverablesPage {...preferenceProps}/>
  if (path === '/atlas') {
    if (auth.loading) return <main className="loading-screen"><div className="loader"/></main>
    if (!auth.user && !guestMode) return <Redirect to={`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.hash}`)}`} navigate={navigate}/>
    if (!auth.user) return <GuestAtlasPage initialState={preferences} onStateChange={updateGuestPreferences} onSignIn={leaveGuest}/>
    return <AtlasPage userId={auth.user.id} email={auth.user.email} initialState={preferences} onStateChange={setPreferences} onSignOut={async () => { await auth.signOut(); navigate('/') }} />
  }
  const authModes = ['/login','/register','/forgot-password','/reset-password'] as const
  if (authModes.includes(path as typeof authModes[number])) {
    if (auth.user && path !== '/reset-password') return <Redirect to={safeRequestedPath} navigate={navigate}/>
    return <AuthPage mode={path.slice(1) as 'login'|'register'|'forgot-password'|'reset-password'} {...preferenceProps} successPath={safeRequestedPath} onNavigate={navigate} onContinueAsGuest={continueAsGuest}/>
  }
  return <LandingPage {...preferenceProps}/>
}

export default function App() {
  return <AuthProvider><Suspense fallback={<main className="loading-screen"><div className="loader"/></main>}><RoutedApp/></Suspense></AuthProvider>
}
