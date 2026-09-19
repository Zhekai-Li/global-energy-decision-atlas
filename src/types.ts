export type DatasetScope = 'assignment-15' | 'expanded-50'
export type SelectionMode = 'countries' | 'regions'
export type RegionDisplayMode = 'members' | 'aggregate'
export type ThemePreference = 'light' | 'dark' | 'system'
export type Locale = 'en' | 'zh-CN' | 'es' | 'ar' | 'fr' | 'pt-BR'
export type MapMetric = 'price' | 'nonFossil' | 'consumption' | 'tradeExposure'
export type SortMetric = MapMetric
export type PriceAudience = 'household' | 'business'

export interface MetricValue {
  value: number | null
  unit: string
  period: string | null
  sourceId: string
  method: 'reported' | 'derived'
  isFallback: boolean
}

export interface EnergyMix {
  solar: number | null
  wind: number | null
  hydro: number | null
  other: number | null
  gas: number | null
  coal: number | null
  oilAndOtherFossil: number | null
}

export interface AtlasRecord {
  datasetScope: DatasetScope
  iso3: string
  country: string
  householdPrice: MetricValue
  businessPrice: MetricValue
  consumption: MetricValue
  production: MetricValue
  tradeExposure: MetricValue
  electricityGeneration: MetricValue
  electricity: EnergyMix
  sources: Record<string, string>
}

export interface DashboardState {
  datasetScope: DatasetScope
  selectionMode: SelectionMode
  regionIds: string[]
  countryCodes: string[]
  focusCountryCodes: string[]
  regionDisplayMode: RegionDisplayMode
  priceAudience: PriceAudience
  mapMetric: MapMetric
  sortMetric: SortMetric
  theme: ThemePreference
  locale: Locale
}

export interface SavedView {
  id: string
  name: string
  state: DashboardState
  updatedAt: string
}
