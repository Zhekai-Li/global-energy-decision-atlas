import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

interface AuthValue {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue>({ session: null, user: null, loading: true, configured: false, signOut: async () => undefined })

export function AuthProvider({ children, testUser }: { children: ReactNode; testUser?: User | null }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(testUser === undefined)
  useEffect(() => {
    if (testUser !== undefined) { setLoading(false); return }
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); setLoading(false) })
    return () => data.subscription.unsubscribe()
  }, [testUser])
  const value = useMemo<AuthValue>(() => ({
    session, user: testUser === undefined ? session?.user ?? null : testUser,
    loading, configured: testUser !== undefined || Boolean(supabase),
    signOut: async () => { if (supabase) await supabase.auth.signOut() },
  }), [loading, session, testUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// This hook intentionally shares the provider module to keep the auth contract private.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
