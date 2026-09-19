export interface RegionDefinition {
  id: string
  labelKey: string
  members: string[]
}

export const REGIONS: RegionDefinition[] = [
  { id: 'global', labelKey: 'regions.global', members: [] },
  { id: 'north-america', labelKey: 'regions.northAmerica', members: ['CAN', 'MEX', 'USA'] },
  { id: 'south-america', labelKey: 'regions.southAmerica', members: ['ARG', 'BRA', 'CHL', 'COL', 'PER'] },
  { id: 'latin-america', labelKey: 'regions.latinAmerica', members: ['ARG', 'BRA', 'CHL', 'COL', 'MEX', 'PER'] },
  { id: 'europe', labelKey: 'regions.europe', members: ['BEL', 'DNK', 'FIN', 'FRA', 'DEU', 'ISL', 'ITA', 'NLD', 'NOR', 'POL', 'RUS', 'ESP', 'SWE', 'CHE', 'UKR', 'GBR'] },
  { id: 'nordics', labelKey: 'regions.nordics', members: ['DNK', 'FIN', 'ISL', 'NOR', 'SWE'] },
  { id: 'east-asia', labelKey: 'regions.eastAsia', members: ['CHN', 'JPN', 'KOR'] },
  { id: 'south-asia', labelKey: 'regions.southAsia', members: ['BGD', 'IND', 'PAK'] },
  { id: 'southeast-asia', labelKey: 'regions.southeastAsia', members: ['IDN', 'MYS', 'PHL', 'SGP', 'THA', 'VNM'] },
  { id: 'central-asia', labelKey: 'regions.centralAsia', members: ['KAZ'] },
  { id: 'middle-east', labelKey: 'regions.middleEast', members: ['IRN', 'SAU', 'TUR', 'ARE'] },
  { id: 'africa', labelKey: 'regions.africa', members: ['DZA', 'EGY', 'ETH', 'KEN', 'MAR', 'NGA', 'ZAF'] },
  { id: 'oceania', labelKey: 'regions.oceania', members: ['AUS', 'NZL'] },
  { id: 'asia-pacific', labelKey: 'regions.asiaPacific', members: ['AUS', 'BGD', 'CHN', 'IDN', 'IND', 'JPN', 'KOR', 'MYS', 'NZL', 'PAK', 'PHL', 'SGP', 'THA', 'VNM'] },
]

export function regionsForCountries(availableCodes: string[]): RegionDefinition[] {
  const available = new Set(availableCodes)
  return REGIONS.filter((region) => region.id === 'global' || region.members.some((code) => available.has(code)))
}

export function normalizeRegionSelection(ids: string[]): string[] {
  const valid = [...new Set(ids)].filter((id) => REGIONS.some((region) => region.id === id))
  if (valid.includes('global')) return ['global']
  return valid.slice(0, 4)
}

export function countriesForRegions(regionIds: string[], availableCodes: string[]): string[] {
  const normalized = normalizeRegionSelection(regionIds)
  if (normalized.includes('global')) return [...availableCodes]
  const available = new Set(availableCodes)
  return [...new Set(normalized.flatMap((id) => REGIONS.find((region) => region.id === id)?.members ?? []))]
    .filter((code) => available.has(code))
}

export function sharedRegionMembership(regionIds: string[]): Record<string, string[]> {
  const membership: Record<string, string[]> = {}
  for (const id of normalizeRegionSelection(regionIds)) {
    const region = REGIONS.find((item) => item.id === id)
    for (const code of region?.members ?? []) membership[code] = [...(membership[code] ?? []), id]
  }
  return Object.fromEntries(Object.entries(membership).filter(([, ids]) => ids.length > 1))
}
