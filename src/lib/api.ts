import { databaseRowToRecord } from '../data-v2'
import { dashboardStateSchema } from '../state'
import type { AtlasRecord, DashboardState, Locale, SavedView, ThemePreference } from '../types'
import { supabase } from './supabase'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchAtlasRecords(): Promise<AtlasRecord[]> {
  const { data, error } = await client().from('atlas_records').select('*')
  if (error) throw error
  return (data ?? []).map(databaseRowToRecord)
}

export async function fetchProfile(userId: string): Promise<{ theme: ThemePreference | null; locale: Locale | null; dashboardState: DashboardState | null }> {
  const { data, error } = await client().from('profiles').select('theme, locale, dashboard_state').eq('user_id', userId).maybeSingle()
  if (error) throw error
  const state = dashboardStateSchema.safeParse(data?.dashboard_state)
  return { theme: data?.theme ?? null, locale: data?.locale ?? null, dashboardState: state.success ? state.data : null }
}

export async function saveProfile(userId: string, state: DashboardState) {
  const valid = dashboardStateSchema.parse(state)
  const { error } = await client().from('profiles').upsert({ user_id: userId, theme: valid.theme, locale: valid.locale, dashboard_state: valid, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function fetchSavedViews(userId: string): Promise<SavedView[]> {
  const { data, error } = await client().from('saved_views').select('id,name,state,updated_at').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).flatMap((row) => {
    const state = dashboardStateSchema.safeParse(row.state)
    return state.success ? [{ id: row.id, name: row.name, state: state.data, updatedAt: row.updated_at }] : []
  })
}

export async function createSavedView(userId: string, name: string, state: DashboardState) {
  if (!name.trim() || name.trim().length > 80) throw new Error('View names must contain 1-80 characters')
  const { error } = await client().from('saved_views').insert({ user_id: userId, name: name.trim(), state: dashboardStateSchema.parse(state) })
  if (error) throw error
}

export async function renameSavedView(id: string, name: string) {
  if (!name.trim() || name.trim().length > 80) throw new Error('View names must contain 1-80 characters')
  const { error } = await client().from('saved_views').update({ name: name.trim(), updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteSavedView(id: string) {
  const { error } = await client().from('saved_views').delete().eq('id', id)
  if (error) throw error
}
