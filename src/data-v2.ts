import Papa from 'papaparse'
import { z } from 'zod'
import type { AtlasRecord, DatasetScope, MetricValue } from './types'

const nullableNumber = z.preprocess((value) => value === '' || value == null ? null : Number(value), z.number().finite().nullable())
const booleanValue = z.preprocess((value) => value === true || value === 'true', z.boolean())

export const expandedCsvRowSchema = z.object({
  iso3: z.string().regex(/^[A-Z]{3}$/), country: z.string().min(1),
  household_price_usd_kwh: nullableNumber, business_price_usd_kwh: nullableNumber, price_period: z.string().min(1),
  consumption_ej: nullableNumber, consumption_year: nullableNumber, consumption_fallback: booleanValue,
  production_ej: nullableNumber, production_year: nullableNumber, production_fallback: booleanValue,
  energy_balance_gap_ej: nullableNumber, electricity_generation_twh: nullableNumber,
  mix_year: nullableNumber, mix_fallback: booleanValue,
  solar_pct: nullableNumber, wind_pct: nullableNumber, hydro_pct: nullableNumber, other_pct: nullableNumber,
  gas_pct: nullableNumber, coal_pct: nullableNumber, oil_other_fossil_pct: nullableNumber,
  price_source_url: z.string().url(), consumption_source_url: z.string().url(), production_source_url: z.string().url(),
  accessed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).strict()

export type ExpandedCsvRow = z.infer<typeof expandedCsvRowSchema>

function metric(value: number | null, unit: string, period: number | string | null, sourceId: string, method: MetricValue['method'], isFallback = false): MetricValue {
  return { value, unit, period: period === null ? null : String(period), sourceId, method, isFallback }
}

export function expandedRowToRecord(row: ExpandedCsvRow): AtlasRecord {
  return {
    datasetScope: 'expanded-50', iso3: row.iso3, country: row.country,
    householdPrice: metric(row.household_price_usd_kwh, 'USD/kWh', row.price_period, 'global-petrol-prices', 'reported'),
    businessPrice: metric(row.business_price_usd_kwh, 'USD/kWh', row.price_period, 'global-petrol-prices', 'reported'),
    consumption: metric(row.consumption_ej, 'EJ', row.consumption_year, 'owid-energy', 'reported', row.consumption_fallback),
    production: metric(row.production_ej, 'EJ', row.production_year, 'eia-international', 'reported', row.production_fallback),
    tradeExposure: metric(row.energy_balance_gap_ej, 'EJ', row.consumption_year, 'energy-balance-gap', 'derived', row.consumption_fallback || row.production_fallback),
    electricityGeneration: metric(row.electricity_generation_twh, 'TWh', row.mix_year, 'owid-energy', 'reported', row.mix_fallback),
    electricity: { solar: row.solar_pct, wind: row.wind_pct, hydro: row.hydro_pct, other: row.other_pct, gas: row.gas_pct, coal: row.coal_pct, oilAndOtherFossil: row.oil_other_fossil_pct },
    sources: { price: row.price_source_url, consumption: row.consumption_source_url, production: row.production_source_url },
  }
}

export function parseExpandedCsv(text: string): AtlasRecord[] {
  const parsed = Papa.parse<Record<string, unknown>>(text.trim(), { header: true, skipEmptyLines: true })
  if (parsed.errors.length) throw new Error(parsed.errors.map((error) => error.message).join('; '))
  const records = parsed.data.map((row) => expandedRowToRecord(expandedCsvRowSchema.parse(row)))
  if (records.length !== 50 || new Set(records.map((row) => row.iso3)).size !== 50) throw new Error('Expected exactly 50 unique ISO3 records')
  for (const record of records) {
    const shares = Object.values(record.electricity)
    if (shares.every((value) => value !== null) && Math.abs(shares.reduce<number>((sum, value) => sum + (value ?? 0), 0) - 100) > 0.2) throw new Error(`Mix total outside tolerance for ${record.iso3}`)
  }
  return records
}

const databaseMetricSchema = z.object({ value: nullableNumber, unit: z.string(), period: z.string().nullable(), sourceId: z.string(), method: z.enum(['reported','derived']), isFallback: z.boolean() })
export const databaseRecordSchema = z.object({
  dataset_scope: z.enum(['assignment-15','expanded-50']), iso3: z.string().regex(/^[A-Z]{3}$/), country: z.string(),
  household_price: databaseMetricSchema, business_price: databaseMetricSchema, consumption: databaseMetricSchema,
  production: databaseMetricSchema, trade_exposure: databaseMetricSchema, electricity_generation: databaseMetricSchema,
  electricity: z.object({ solar: nullableNumber, wind: nullableNumber, hydro: nullableNumber, other: nullableNumber, gas: nullableNumber, coal: nullableNumber, oilAndOtherFossil: nullableNumber }),
  sources: z.record(z.string(), z.string()),
})

export function databaseRowToRecord(input: unknown): AtlasRecord {
  const row = databaseRecordSchema.parse(input)
  return {
    datasetScope: row.dataset_scope, iso3: row.iso3, country: row.country,
    householdPrice: row.household_price, businessPrice: row.business_price, consumption: row.consumption,
    production: row.production, tradeExposure: row.trade_exposure, electricityGeneration: row.electricity_generation,
    electricity: row.electricity, sources: row.sources,
  }
}

export function recordToDatabaseRow(record: AtlasRecord) {
  return {
    dataset_scope: record.datasetScope, iso3: record.iso3, country: record.country,
    household_price: record.householdPrice, business_price: record.businessPrice, consumption: record.consumption,
    production: record.production, trade_exposure: record.tradeExposure, electricity_generation: record.electricityGeneration,
    electricity: record.electricity, sources: record.sources,
  }
}

export function recordsForScope(records: AtlasRecord[], scope: DatasetScope) {
  return records.filter((record) => record.datasetScope === scope)
}
