#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import Papa from 'papaparse'
import { closestRow, numberOrNull as num, parsePublicPriceTable, selectCoverageYear } from './lib/expanded-source-parsers.mjs'

const ACCESSED = new Date().toISOString().slice(0, 10)
const OWID_URL = 'https://owid-public.owid.io/data/energy/owid-energy-data.csv'
const EIA_URL = 'https://api.eia.gov/bulk/INTL.zip'
const PRICE_URL = 'https://www.globalpetrolprices.com/electricity_prices/'
const OUTPUT = new URL('../data/expanded-energy-50-v1.csv', import.meta.url)
const MANIFEST = new URL('../data/expanded-energy-50-v1.sources.json', import.meta.url)
const CONTEXT_SOURCES = [
  { id: 'iea-italy-2023', url: 'https://www.iea.org/reports/italy-2023/executive-summary', use: "Market context for Italy's electricity system and policy setting" },
  { id: 'eurostat-energy-data', url: 'https://ec.europa.eu/eurostat/en/web/energy/information-data', use: 'Market context for the components of European electricity prices' },
  { id: 'world-bank-ethiopia-energy-compact', url: 'https://www.worldbank.org/content/dam/theworldbankgroupasset/document/2026/Ethiopia-National-Energy-Compact-Mission-300.pdf', use: "Market context for Ethiopia's power system and access program" },
  { id: 'iea-electricity-2025', url: 'https://www.iea.org/reports/electricity-2025/executive-summary', use: 'Market context for electricity demand and supply in China' },
  { id: 'eia-us-energy-balance-2023', url: 'https://www.eia.gov/todayinenergy/detail.php?id=62407', use: 'Market context for the United States 2023 energy balance' },
  { id: 'eia-russia-country-analysis', url: 'https://www.eia.gov/international/content/analysis/countries_long/russia/', use: "Market context for Russia's energy production and exports" },
]

const countries = [
  ['ARG','Argentina'],['AUS','Australia'],['BGD','Bangladesh'],['BEL','Belgium'],['BRA','Brazil'],['CAN','Canada'],['CHL','Chile'],['CHN','China'],['COL','Colombia'],['DEU','Germany'],
  ['DNK','Denmark'],['DZA','Algeria'],['EGY','Egypt'],['ESP','Spain'],['ETH','Ethiopia'],['FIN','Finland'],['FRA','France'],['GBR','United Kingdom'],['IDN','Indonesia'],['IND','India'],
  ['IRN','Iran'],['ISL','Iceland'],['ITA','Italy'],['JPN','Japan'],['KAZ','Kazakhstan'],['KEN','Kenya'],['KOR','South Korea'],['MAR','Morocco'],['MEX','Mexico'],['MYS','Malaysia'],
  ['NGA','Nigeria'],['NLD','Netherlands'],['NOR','Norway'],['NZL','New Zealand'],['PAK','Pakistan'],['PER','Peru'],['PHL','Philippines'],['POL','Poland'],['RUS','Russia'],['SAU','Saudi Arabia'],
  ['SGP','Singapore'],['SWE','Sweden'],['CHE','Switzerland'],['THA','Thailand'],['TUR','Turkey'],['UKR','Ukraine'],['ARE','United Arab Emirates'],['USA','United States'],['VNM','Vietnam'],['ZAF','South Africa'],
]

const priceAliases = { USA: 'USA', KOR: 'South Korea', GBR: 'United Kingdom', ARE: 'United Arab Emirates' }
const requiredOwid = ['primary_energy_consumption','electricity_generation','solar_share_elec','wind_share_elec','hydro_share_elec','gas_share_elec','coal_share_elec','oil_share_elec']

function fail(message) { throw new Error(message) }
function round(value, digits = 6) { return value === null ? null : Number(value.toFixed(digits)) }
function csvCell(value) { return value === null ? '' : value }

async function download(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Global Energy Decision Atlas data updater' } })
  if (!response.ok) fail(`${url} returned ${response.status}`)
  return response
}

function validateOutput(rows) {
  if (rows.length !== 50 || new Set(rows.map((row) => row.iso3)).size !== 50) fail('Expected 50 unique ISO3 records')
  const assignment = new Set(['CHN','USA','IND','RUS','JPN','CAN','DEU','BRA','KOR','IRN','SAU','IDN','FRA','MEX','GBR'])
  for (const iso of assignment) if (!rows.some((row) => row.iso3 === iso)) fail(`Assignment country missing: ${iso}`)
  for (const row of rows) {
    if (!/^[A-Z]{3}$/.test(row.iso3)) fail(`Invalid ISO3: ${row.iso3}`)
    const mix = ['solar_pct','wind_pct','hydro_pct','other_pct','gas_pct','coal_pct','oil_other_fossil_pct'].map((field) => row[field])
    if (mix.some((value) => value !== null && (value < 0 || value > 100))) fail(`Invalid share for ${row.iso3}`)
    if (mix.every((value) => value !== null) && Math.abs(mix.reduce((a, b) => a + b, 0) - 100) > 0.2) fail(`Mix does not total 100 for ${row.iso3}`)
    for (const field of ['price_source_url','consumption_source_url','production_source_url']) if (!URL.canParse(row[field])) fail(`Invalid ${field} for ${row.iso3}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.accessed_date)) fail(`Invalid access date for ${row.iso3}`)
  }
  const missing = (field) => rows.filter((row) => row[field] === null).length / rows.length
  for (const field of ['consumption_ej','production_ej','electricity_generation_twh']) if (missing(field) > 0.1) fail(`${field} missing rate exceeds 10%`)
}

const [owidText, priceHtml, eiaResponse] = await Promise.all([
  (await download(OWID_URL)).text(),
  (await download(PRICE_URL)).text(),
  download(EIA_URL),
])
const parsed = Papa.parse(owidText, { header: true, skipEmptyLines: true })
if (parsed.errors.length) fail(parsed.errors[0].message)
for (const field of ['country','year','iso_code',...requiredOwid]) if (!parsed.meta.fields.includes(field)) fail(`OWID column missing: ${field}`)
const isoCodes = countries.map(([iso]) => iso)
const energyYear = selectCoverageYear(parsed.data, isoCodes, requiredOwid)
const prices = parsePublicPriceTable(priceHtml)

const temp = await mkdtemp(join(tmpdir(), 'energy-atlas-'))
const zip = join(temp, 'INTL.zip')
await writeFile(zip, Buffer.from(await eiaResponse.arrayBuffer()))
execFileSync('unzip', ['-q', zip, '-d', temp])
const eiaLines = (await readFile(join(temp, 'INTL.txt'), 'utf8')).split('\n')
const production = new Map()
for (const line of eiaLines) {
  if (!line.includes('"units":"terajoules"') || !line.includes('"name":"Total energy production')) continue
  const item = JSON.parse(line)
  if (!countries.some(([iso]) => iso === item.geography)) continue
  const existing = production.get(item.geography)
  if (!existing || item.series_id.includes(`-${item.geography}-TJ.A`)) production.set(item.geography, item)
}
await rm(temp, { recursive: true })
if (production.size < 45) fail(`EIA structure changed: found ${production.size}/50 production series`)
const eiaCoverage = new Map()
for (const item of production.values()) for (const [year, value] of item.data) if (value !== null) eiaCoverage.set(Number(year), (eiaCoverage.get(Number(year)) ?? 0) + 1)
const productionYear = [...eiaCoverage.entries()].filter(([, count]) => count / countries.length >= 0.9).sort(([a],[b]) => b-a)[0]?.[0]
if (!productionYear) fail('No EIA production year reaches 90% coverage')
const balanceYear = Math.min(energyYear, productionYear)

const rows = countries.map(([iso3, country]) => {
  const energy = closestRow(parsed.data, iso3, energyYear, requiredOwid)
  const price = prices.get(priceAliases[iso3] ?? country) ?? { household: null, business: null }
  const eia = production.get(iso3)
  const productionPoint = eia?.data.find(([year]) => Number(year) <= balanceYear && Number(year) >= balanceYear - 2)
  const consumption = energy ? num(energy.primary_energy_consumption) / 277.7777778 : null
  const productionEj = productionPoint ? Number(productionPoint[1]) / 1_000_000 : null
  const shares = energy ? ['solar_share_elec','wind_share_elec','hydro_share_elec','gas_share_elec','coal_share_elec','oil_share_elec'].map((field) => num(energy[field])) : Array(6).fill(null)
  const other = shares.every((value) => value !== null) ? Math.max(0, 100 - shares.reduce((a, b) => a + b, 0)) : null
  return {
    iso3, country,
    household_price_usd_kwh: price.household,
    business_price_usd_kwh: price.business,
    price_period: '2023-2026 average',
    consumption_ej: round(consumption), consumption_year: energy ? Number(energy.year) : null, consumption_fallback: energy ? Number(energy.year) !== energyYear : false,
    production_ej: round(productionEj), production_year: productionPoint ? Number(productionPoint[0]) : null, production_fallback: productionPoint ? Number(productionPoint[0]) !== balanceYear : false,
    energy_balance_gap_ej: consumption !== null && productionEj !== null ? round(consumption - productionEj) : null,
    electricity_generation_twh: energy ? round(num(energy.electricity_generation), 3) : null,
    mix_year: energy ? Number(energy.year) : null, mix_fallback: energy ? Number(energy.year) !== energyYear : false,
    solar_pct: round(shares[0],3), wind_pct: round(shares[1],3), hydro_pct: round(shares[2],3), other_pct: round(other,3),
    gas_pct: round(shares[3],3), coal_pct: round(shares[4],3), oil_other_fossil_pct: round(shares[5],3),
    price_source_url: PRICE_URL, consumption_source_url: OWID_URL, production_source_url: EIA_URL, accessed_date: ACCESSED,
  }
})
validateOutput(rows)
const csv = Papa.unparse(rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, csvCell(value)]))), { newline: '\n' }) + '\n'
const sha256 = createHash('sha256').update(csv).digest('hex')
await writeFile(OUTPUT, csv)
await writeFile(MANIFEST, JSON.stringify({
  dataset: 'expanded-50', version: 1, accessedDate: ACCESSED, rows: 50, sha256,
  selection: { energyYear, productionYear: balanceYear, latestEiaProductionCoverageYear: productionYear, minimumCoverage: 0.9, maximumFallbackYears: 2 },
  sources: [
    { id: 'global-petrol-prices', url: PRICE_URL, measure: 'Public 2023-2026 residential and business USD/kWh averages' },
    { id: 'owid-energy', url: OWID_URL, measure: 'Primary energy consumption and electricity generation mix' },
    { id: 'eia-international', url: EIA_URL, measure: 'Total energy production' },
  ],
  contextSources: CONTEXT_SOURCES,
}, null, 2) + '\n')
console.log(`Wrote 50 rows for aligned energy and production year ${balanceYear}; sha256 ${sha256}`)
