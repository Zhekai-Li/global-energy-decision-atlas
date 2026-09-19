#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const root = new URL('../', import.meta.url)
const assignmentText = await readFile(new URL('data/energy-data.csv', root), 'utf8')
const expandedText = await readFile(new URL('data/expanded-energy-50-v1.csv', root), 'utf8')
const manifest = JSON.parse(await readFile(new URL('data/expanded-energy-50-v1.sources.json', root), 'utf8'))
const assignmentSha = createHash('sha256').update(assignmentText).digest('hex')
if (assignmentSha !== 'c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa') throw new Error('The immutable assignment CSV checksum changed')
const iso = { China:'CHN','United States':'USA',India:'IND',Russia:'RUS',Japan:'JPN',Canada:'CAN',Germany:'DEU',Brazil:'BRA','South Korea':'KOR',Iran:'IRN','Saudi Arabia':'SAU',Indonesia:'IDN',France:'FRA',Mexico:'MEX','United Kingdom':'GBR' }
const n = (value) => value === '' ? null : Number(value)
const metric = (value, unit, period, sourceId, method='reported', isFallback=false) => ({ value, unit, period: period == null ? null : String(period), sourceId, method, isFallback })
const assignmentRows = Papa.parse(assignmentText.trim(), { header:true, skipEmptyLines:true }).data.map((row) => ({
  dataset_scope:'assignment-15', iso3:iso[row.country], country:row.country,
  household_price:metric(n(row.household_price_usd_per_kwh),'USD/kWh',row.price_period,'assignment-price'),
  business_price:metric(n(row.business_price_usd_per_kwh),'USD/kWh',row.price_period,'assignment-price'),
  consumption:metric(n(row.total_energy_consumption_exajoules),'EJ',row.total_energy_consumption_year,'assignment-consumption'),
  production:metric(n(row.total_energy_domestic_production_ej),'EJ',row.total_energy_production_trade_year,'assignment-trade'),
  trade_exposure:metric(n(row.total_energy_net_imports_ej),'EJ',row.total_energy_production_trade_year,'assignment-net-imports'),
  electricity_generation:metric(n(row.electricity_domestic_generation_twh),'TWh',row.electricity_production_trade_year,'assignment-electricity'),
  electricity:{ solar:n(row.electricity_generation_solar_pct),wind:n(row.electricity_generation_wind_pct),hydro:n(row.electricity_generation_hydro_pct),other:n(row.electricity_generation_other_pct),gas:n(row.electricity_generation_gas_pct),coal:n(row.electricity_generation_coal_pct),oilAndOtherFossil:n(row.electricity_generation_oil_and_other_fossil_pct) },
  sources:{ price:row.price_source_url,consumption:row.consumption_source_url,mix:row.mix_source_url,trade:row.total_energy_production_trade_source_url },
}))
const expandedRows = Papa.parse(expandedText.trim(), { header:true, skipEmptyLines:true }).data.map((row) => ({
  dataset_scope:'expanded-50',iso3:row.iso3,country:row.country,
  household_price:metric(n(row.household_price_usd_kwh),'USD/kWh',row.price_period,'global-petrol-prices'), business_price:metric(n(row.business_price_usd_kwh),'USD/kWh',row.price_period,'global-petrol-prices'),
  consumption:metric(n(row.consumption_ej),'EJ',row.consumption_year,'owid-energy','reported',row.consumption_fallback==='true'), production:metric(n(row.production_ej),'EJ',row.production_year,'eia-international','reported',row.production_fallback==='true'),
  trade_exposure:metric(n(row.energy_balance_gap_ej),'EJ',row.consumption_year,'energy-balance-gap','derived',row.consumption_fallback==='true'||row.production_fallback==='true'), electricity_generation:metric(n(row.electricity_generation_twh),'TWh',row.mix_year,'owid-energy','reported',row.mix_fallback==='true'),
  electricity:{solar:n(row.solar_pct),wind:n(row.wind_pct),hydro:n(row.hydro_pct),other:n(row.other_pct),gas:n(row.gas_pct),coal:n(row.coal_pct),oilAndOtherFossil:n(row.oil_other_fossil_pct)}, sources:{price:row.price_source_url,consumption:row.consumption_source_url,production:row.production_source_url},
}))
const all = [...assignmentRows,...expandedRows]
const { error: countryError } = await supabase.from('countries').upsert([...new Map(all.map((row) => [row.iso3,{iso3:row.iso3,name_en:row.country}])).values()])
if (countryError) throw countryError
const datasetInputs = [
  { slug:'assignment-15',title:'Assignment 15',version:1,checksum_sha256:assignmentSha,source_manifest:{immutable:true,rows:15} },
  { slug:'expanded-50',title:'Expanded 50',version:1,checksum_sha256:manifest.sha256,source_manifest:manifest },
]
const { data: datasets, error: datasetError } = await supabase.from('datasets').upsert(datasetInputs,{onConflict:'slug'}).select('id,slug')
if (datasetError) throw datasetError
for (const row of all) {
  const dataset_id = datasets.find((dataset) => dataset.slug === row.dataset_scope).id
  const { dataset_scope: _scope, iso3: country_iso3, country: _country, ...values } = row
  const { error } = await supabase.from('energy_records').upsert({dataset_id,country_iso3,...values},{onConflict:'dataset_id,country_iso3'})
  if (error) throw error
}
console.log(`Seeded ${all.length} protected energy records`)
