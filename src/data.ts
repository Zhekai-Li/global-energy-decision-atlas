import Papa from 'papaparse'
import { z } from 'zod'
import csvText from '../data/energy-data.csv?raw'

const numericString = z.string().refine((value) => value !== '' && Number.isFinite(Number(value)), 'Expected a number')
const optionalNumericString = z.string().refine((value) => value === '' || Number.isFinite(Number(value)), 'Expected a number or blank')

export const csvRecordSchema = z.object({
  total_energy_consumption_rank: numericString,
  country: z.string().min(1),
  total_energy_consumption_year: numericString,
  total_energy_consumption_exajoules: numericString,
  energy_price_type: z.literal('Electricity'),
  household_price_usd_per_kwh: optionalNumericString,
  business_price_usd_per_kwh: optionalNumericString,
  price_period: z.string().min(1),
  local_currency: z.string().min(1),
  household_price_local_currency_per_kwh: optionalNumericString,
  business_price_local_currency_per_kwh: optionalNumericString,
  price_basis: z.string().min(1),
  price_source_url: z.string().url(),
  consumption_source_url: z.string().url(),
  accessed_date: z.string().min(1),
  notes: z.string().min(1),
  mix_year: numericString,
  electricity_generation_solar_pct: numericString,
  electricity_generation_wind_pct: numericString,
  electricity_generation_oil_and_other_fossil_pct: numericString,
  electricity_generation_gas_pct: numericString,
  electricity_generation_coal_pct: numericString,
  electricity_generation_hydro_pct: numericString,
  electricity_generation_other_pct: numericString,
  primary_energy_consumption_solar_pct: numericString,
  primary_energy_consumption_wind_pct: numericString,
  primary_energy_consumption_oil_pct: numericString,
  primary_energy_consumption_gas_pct: numericString,
  primary_energy_consumption_coal_pct: numericString,
  primary_energy_consumption_hydro_pct: numericString,
  primary_energy_consumption_other_pct: numericString,
  electricity_mix_basis: z.string().min(1),
  primary_energy_mix_basis: z.string().min(1),
  mix_source_url: z.string().url(),
  mix_definitions_url: z.string().url(),
  mix_notes: z.string().min(1),
  total_energy_production_trade_year: numericString,
  total_energy_domestic_production_ej: numericString,
  total_energy_gross_imports_ej: numericString,
  total_energy_gross_exports_ej: numericString,
  total_energy_net_imports_ej: numericString,
  electricity_production_trade_year: numericString,
  electricity_domestic_generation_twh: numericString,
  electricity_gross_imports_twh: numericString,
  electricity_gross_exports_twh: numericString,
  electricity_net_imports_twh: numericString,
  total_energy_production_trade_source_url: z.string().url(),
  electricity_production_trade_source_url: z.string().url(),
  production_trade_notes: z.string().min(1),
}).strict()

export type RawEnergyRecord = z.infer<typeof csvRecordSchema>

export interface EnergyRecord {
  rank: number
  country: string
  consumptionYear: number
  totalConsumptionEj: number
  householdPriceUsd: number | null
  businessPriceUsd: number | null
  pricePeriod: string
  localCurrency: string
  householdPriceLocal: number | null
  businessPriceLocal: number | null
  priceBasis: string
  priceSourceUrl: string
  consumptionSourceUrl: string
  accessedDate: string
  notes: string
  mixYear: number
  electricity: {
    solar: number
    wind: number
    oilAndOtherFossil: number
    gas: number
    coal: number
    hydro: number
    other: number
  }
  primary: {
    solar: number
    wind: number
    oil: number
    gas: number
    coal: number
    hydro: number
    other: number
  }
  electricityMixBasis: string
  primaryEnergyMixBasis: string
  mixSourceUrl: string
  mixDefinitionsUrl: string
  mixNotes: string
  tradeYear: number
  domesticProductionEj: number
  grossImportsEj: number
  grossExportsEj: number
  netImportsEj: number
  electricityTradeYear: number
  electricityGenerationTwh: number
  electricityGrossImportsTwh: number
  electricityGrossExportsTwh: number
  electricityNetImportsTwh: number
  totalEnergyTradeSourceUrl: string
  electricityTradeSourceUrl: string
  tradeNotes: string
}

const n = (value: string) => Number(value)
const maybeN = (value: string) => value === '' ? null : Number(value)

function toEnergyRecord(row: RawEnergyRecord): EnergyRecord {
  return {
    rank: n(row.total_energy_consumption_rank),
    country: row.country,
    consumptionYear: n(row.total_energy_consumption_year),
    totalConsumptionEj: n(row.total_energy_consumption_exajoules),
    householdPriceUsd: maybeN(row.household_price_usd_per_kwh),
    businessPriceUsd: maybeN(row.business_price_usd_per_kwh),
    pricePeriod: row.price_period,
    localCurrency: row.local_currency,
    householdPriceLocal: maybeN(row.household_price_local_currency_per_kwh),
    businessPriceLocal: maybeN(row.business_price_local_currency_per_kwh),
    priceBasis: row.price_basis,
    priceSourceUrl: row.price_source_url,
    consumptionSourceUrl: row.consumption_source_url,
    accessedDate: row.accessed_date,
    notes: row.notes,
    mixYear: n(row.mix_year),
    electricity: {
      solar: n(row.electricity_generation_solar_pct), wind: n(row.electricity_generation_wind_pct),
      oilAndOtherFossil: n(row.electricity_generation_oil_and_other_fossil_pct), gas: n(row.electricity_generation_gas_pct),
      coal: n(row.electricity_generation_coal_pct), hydro: n(row.electricity_generation_hydro_pct), other: n(row.electricity_generation_other_pct),
    },
    primary: {
      solar: n(row.primary_energy_consumption_solar_pct), wind: n(row.primary_energy_consumption_wind_pct),
      oil: n(row.primary_energy_consumption_oil_pct), gas: n(row.primary_energy_consumption_gas_pct),
      coal: n(row.primary_energy_consumption_coal_pct), hydro: n(row.primary_energy_consumption_hydro_pct), other: n(row.primary_energy_consumption_other_pct),
    },
    electricityMixBasis: row.electricity_mix_basis,
    primaryEnergyMixBasis: row.primary_energy_mix_basis,
    mixSourceUrl: row.mix_source_url,
    mixDefinitionsUrl: row.mix_definitions_url,
    mixNotes: row.mix_notes,
    tradeYear: n(row.total_energy_production_trade_year), domesticProductionEj: n(row.total_energy_domestic_production_ej),
    grossImportsEj: n(row.total_energy_gross_imports_ej), grossExportsEj: n(row.total_energy_gross_exports_ej), netImportsEj: n(row.total_energy_net_imports_ej),
    electricityTradeYear: n(row.electricity_production_trade_year), electricityGenerationTwh: n(row.electricity_domestic_generation_twh),
    electricityGrossImportsTwh: n(row.electricity_gross_imports_twh), electricityGrossExportsTwh: n(row.electricity_gross_exports_twh),
    electricityNetImportsTwh: n(row.electricity_net_imports_twh), totalEnergyTradeSourceUrl: row.total_energy_production_trade_source_url,
    electricityTradeSourceUrl: row.electricity_production_trade_source_url, tradeNotes: row.production_trade_notes,
  }
}

export function parseEnergyCsv(text: string): EnergyRecord[] {
  const parsed = Papa.parse<Record<string, string>>(text.trim(), { header: true, skipEmptyLines: true })
  if (parsed.errors.length) throw new Error(parsed.errors.map((error) => error.message).join('; '))
  if (parsed.meta.fields?.length !== 49) throw new Error(`Expected 49 columns, received ${parsed.meta.fields?.length ?? 0}`)
  const records = parsed.data.map((row) => toEnergyRecord(csvRecordSchema.parse(row)))
  if (records.length !== 15 || new Set(records.map((row) => row.country)).size !== 15) throw new Error('Expected exactly 15 unique countries')
  records.forEach((record) => {
    const shares = [...Object.values(record.electricity), ...Object.values(record.primary)]
    if (shares.some((value) => value < 0 || value > 100)) throw new Error(`Invalid percentage for ${record.country}`)
    const electricityTotal = Object.values(record.electricity).reduce((sum, value) => sum + value, 0)
    const primaryTotal = Object.values(record.primary).reduce((sum, value) => sum + value, 0)
    if (Math.abs(electricityTotal - 100) > 0.11 || Math.abs(primaryTotal - 100) > 0.11) throw new Error(`Mix total outside tolerance for ${record.country}`)
  })
  const iran = records.find((record) => record.country === 'Iran')
  if (!iran || iran.householdPriceUsd !== null || iran.businessPriceUsd !== null) throw new Error('Expected missing Iranian price values')
  return records
}

export const energyRecords = parseEnergyCsv(csvText)

export type PriceAudience = 'household' | 'business'
export type SortMetric = 'price' | 'consumption' | 'nonFossil' | 'netImports'

export interface EnergyComparison extends EnergyRecord {
  nonFossilElectricityPct: number
  fossilElectricityPct: number
  selectedPriceUsd: number | null
  netImportDirection: 'Net importer' | 'Net exporter' | 'Balanced'
}

export function toComparison(record: EnergyRecord, audience: PriceAudience): EnergyComparison {
  const nonFossilElectricityPct = record.electricity.solar + record.electricity.wind + record.electricity.hydro + record.electricity.other
  const fossilElectricityPct = record.electricity.oilAndOtherFossil + record.electricity.gas + record.electricity.coal
  return {
    ...record,
    nonFossilElectricityPct,
    fossilElectricityPct,
    selectedPriceUsd: audience === 'household' ? record.householdPriceUsd : record.businessPriceUsd,
    netImportDirection: record.netImportsEj > 0.005 ? 'Net importer' : record.netImportsEj < -0.005 ? 'Net exporter' : 'Balanced',
  }
}

export function sortComparisons(records: EnergyComparison[], metric: SortMetric): EnergyComparison[] {
  return [...records].sort((a, b) => {
    if (metric === 'price') return (a.selectedPriceUsd ?? Infinity) - (b.selectedPriceUsd ?? Infinity)
    if (metric === 'consumption') return b.totalConsumptionEj - a.totalConsumptionEj
    if (metric === 'nonFossil') return b.nonFossilElectricityPct - a.nonFossilElectricityPct
    return b.netImportsEj - a.netImportsEj
  })
}

export const DEFAULT_COUNTRIES = ['United States', 'Germany', 'Brazil', 'Indonesia']

export function evidenceFor(records: EnergyComparison[]) {
  const priced = records.filter((record) => record.selectedPriceUsd !== null)
  const lowest = [...priced].sort((a, b) => a.selectedPriceUsd! - b.selectedPriceUsd!)[0]
  const cleanest = [...records].sort((a, b) => b.nonFossilElectricityPct - a.nonFossilElectricityPct)[0]
  const mostExposed = [...records].sort((a, b) => b.netImportsEj - a.netImportsEj)[0]
  return { lowest, cleanest, mostExposed }
}

export const datasetMetadata = {
  sourceUrl: 'https://drive.google.com/file/d/1IH_jMJhRQglxaVP0jpVC_D6l3oU_ZoJu/view?usp=sharing',
  accessedDate: '2026-09-17',
  rows: 15,
  columns: 49,
  sha256: 'c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa',
}
