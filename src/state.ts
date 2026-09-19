import { z } from 'zod'
import { countriesForRegions, normalizeRegionSelection, regionsForCountries } from './regions'
import type { AtlasRecord, DashboardState, DatasetScope } from './types'

export const dashboardStateSchema = z.object({
  datasetScope: z.enum(['assignment-15', 'expanded-50']),
  selectionMode: z.enum(['countries', 'regions']),
  regionIds: z.array(z.string()).max(4),
  countryCodes: z.array(z.string().regex(/^[A-Z]{3}$/)).max(50),
  focusCountryCodes: z.array(z.string().regex(/^[A-Z]{3}$/)).max(8),
  regionDisplayMode: z.enum(['members', 'aggregate']),
  priceAudience: z.enum(['household', 'business']),
  mapMetric: z.enum(['price', 'nonFossil', 'consumption', 'tradeExposure']),
  sortMetric: z.enum(['price', 'nonFossil', 'consumption', 'tradeExposure']),
  theme: z.enum(['light', 'dark', 'system']),
  locale: z.enum(['en', 'zh-CN', 'es', 'ar', 'fr', 'pt-BR']),
}).strict()

export const DEFAULT_STATE: DashboardState = {
  datasetScope: 'expanded-50',
  selectionMode: 'regions',
  regionIds: ['global'],
  countryCodes: [],
  focusCountryCodes: [],
  regionDisplayMode: 'members',
  priceAudience: 'household',
  mapMetric: 'price',
  sortMetric: 'price',
  theme: 'system',
  locale: 'en',
}

export const STORAGE_KEY = 'energy-atlas-preferences-v2'
const LEGACY_KEY = 'energy-atlas-preferences-v1'

export function loadLocalState(): DashboardState {
  try {
    const current = dashboardStateSchema.safeParse(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
    if (current.success) return current.data
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? 'null') as null | { countries?: string[]; audience?: string; sort?: string }
    if (legacy) {
      const nameToIso: Record<string, string> = { 'United States': 'USA', Germany: 'DEU', Brazil: 'BRA', Indonesia: 'IDN', China: 'CHN', India: 'IND', Iran: 'IRN', France: 'FRA', Canada: 'CAN', Russia: 'RUS', Japan: 'JPN', 'South Korea': 'KOR', 'United Kingdom': 'GBR', Australia: 'AUS', Mexico: 'MEX' }
      return dashboardStateSchema.parse({
        ...DEFAULT_STATE,
        selectionMode: 'countries',
        countryCodes: (legacy.countries ?? []).map((name) => nameToIso[name]).filter(Boolean),
        focusCountryCodes: (legacy.countries ?? []).map((name) => nameToIso[name]).filter(Boolean).slice(0, 8),
        priceAudience: legacy.audience === 'business' ? 'business' : 'household',
        sortMetric: legacy.sort === 'netImports' ? 'tradeExposure' : ['price', 'consumption', 'nonFossil'].includes(legacy.sort ?? '') ? legacy.sort : 'price',
      })
    }
  } catch { /* invalid local data is ignored */ }
  return DEFAULT_STATE
}

export function saveLocalState(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardStateSchema.parse(state)))
}

export function metricValue(record: AtlasRecord, metric: DashboardState['mapMetric'], audience: DashboardState['priceAudience']): number | null {
  if (metric === 'price') return (audience === 'household' ? record.householdPrice : record.businessPrice).value
  if (metric === 'nonFossil') {
    const values = [record.electricity.solar, record.electricity.wind, record.electricity.hydro, record.electricity.other]
    return values.some((value) => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  }
  return record[metric].value
}

export function topFocusCountries(records: AtlasRecord[], scopeCodes: string[], pinned: string[] = []): string[] {
  const inScope = new Set(scopeCodes)
  const validPinned = [...new Set(pinned)].filter((code) => inScope.has(code)).slice(0, 8)
  const ranked = records.filter((record) => inScope.has(record.iso3) && !validPinned.includes(record.iso3))
    .sort((a, b) => (b.consumption.value ?? -Infinity) - (a.consumption.value ?? -Infinity))
    .map((record) => record.iso3)
  return [...validPinned, ...ranked].slice(0, 8)
}

export function reconcileState(state: DashboardState, records: AtlasRecord[], scope: DatasetScope = state.datasetScope): DashboardState {
  const available = records.filter((record) => record.datasetScope === scope).map((record) => record.iso3)
  const availableSet = new Set(available)
  const availableRegionIds = new Set(regionsForCountries(available).map((region) => region.id))
  const validRegions = normalizeRegionSelection(state.regionIds).filter((id) => availableRegionIds.has(id))
  const regionIds = validRegions.length ? validRegions : ['global']
  const countryCodes = state.selectionMode === 'regions'
    ? countriesForRegions(regionIds, available)
    : state.countryCodes.filter((code) => availableSet.has(code))
  return dashboardStateSchema.parse({
    ...state,
    datasetScope: scope,
    regionIds,
    countryCodes,
    focusCountryCodes: topFocusCountries(records.filter((record) => record.datasetScope === scope), countryCodes, state.focusCountryCodes),
  })
}
