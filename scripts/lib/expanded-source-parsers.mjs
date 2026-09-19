export function numberOrNull(value) {
  return value === '' || value == null ? null : Number(value)
}

export function selectCoverageYear(rows, isoCodes, fields, minimum = 0.9) {
  const wanted = new Set(isoCodes)
  const coverage = new Map()
  for (const row of rows) {
    if (!wanted.has(row.iso_code)) continue
    const year = Number(row.year)
    if (fields.every((field) => numberOrNull(row[field]) !== null)) coverage.set(year, (coverage.get(year) ?? 0) + 1)
  }
  const eligible = [...coverage.entries()].filter(([, count]) => count / wanted.size >= minimum).sort(([a], [b]) => b - a)
  if (!eligible.length) throw new Error(`No year reaches ${minimum * 100}% coverage for ${fields.join(', ')}`)
  return eligible[0][0]
}

export function closestRow(rows, iso, targetYear, fields, maximumFallbackYears = 2) {
  return rows.filter((item) => item.iso_code === iso && Number(item.year) <= targetYear && Number(item.year) >= targetYear - maximumFallbackYears)
    .filter((item) => fields.every((field) => numberOrNull(item[field]) !== null))
    .sort((a, b) => Number(b.year) - Number(a.year))[0] ?? null
}

export function parsePublicPriceTable(html, minimumRows = 100) {
  if (!html.includes('Residential and Business Electricity Prices by Country (2023-2026 averages)')) throw new Error('Price page heading changed')
  const matches = [...html.matchAll(/<tr>\s*<td><a href="\/[^\"]+\/electricity_prices\/"[^>]*>([^<]+)<\/a><\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g)]
  if (matches.length < minimumRows) throw new Error(`Price table structure changed: parsed ${matches.length} rows`)
  return new Map(matches.map(([, name, household, business]) => [name.trim(), { household: numberOrNull(household.trim()), business: numberOrNull(business.trim()) }]))
}
