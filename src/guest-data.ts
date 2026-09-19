import rawExpanded from '../data/expanded-energy-50-v1.csv?raw'
import { energyRecords } from './data'
import { parseExpandedCsv } from './data-v2'
import type { AtlasRecord, MetricValue } from './types'

const iso3ByCountry: Record<string, string> = {
  Brazil: 'BRA', Canada: 'CAN', China: 'CHN', France: 'FRA', Germany: 'DEU', India: 'IND', Indonesia: 'IDN', Iran: 'IRN',
  Japan: 'JPN', Mexico: 'MEX', Russia: 'RUS', 'Saudi Arabia': 'SAU', 'South Korea': 'KOR', 'United Kingdom': 'GBR', 'United States': 'USA',
}

function metric(value: number | null, unit: string, period: number | string, sourceId: string): MetricValue {
  return { value, unit, period: String(period), sourceId, method: 'reported', isFallback: false }
}

const assignmentRecords: AtlasRecord[] = energyRecords.map((record) => ({
  datasetScope: 'assignment-15',
  iso3: iso3ByCountry[record.country],
  country: record.country,
  householdPrice: metric(record.householdPriceUsd, 'USD/kWh', record.pricePeriod, 'global-petrol-prices'),
  businessPrice: metric(record.businessPriceUsd, 'USD/kWh', record.pricePeriod, 'global-petrol-prices'),
  consumption: metric(record.totalConsumptionEj, 'EJ', record.consumptionYear, 'assignment-consumption'),
  production: metric(record.domesticProductionEj, 'EJ', record.tradeYear, 'assignment-production-trade'),
  tradeExposure: metric(record.netImportsEj, 'EJ', record.tradeYear, 'assignment-net-imports'),
  electricityGeneration: metric(record.electricityGenerationTwh, 'TWh', record.electricityTradeYear, 'assignment-electricity-trade'),
  electricity: record.electricity,
  sources: { price: record.priceSourceUrl, consumption: record.consumptionSourceUrl, production: record.totalEnergyTradeSourceUrl },
}))

export const guestRecords: AtlasRecord[] = [...assignmentRecords, ...parseExpandedCsv(rawExpanded)]
