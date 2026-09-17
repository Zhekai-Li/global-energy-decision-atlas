import { describe, expect, it } from 'vitest'
import rawCsv from '../../data/energy-data.csv?raw'
import { energyRecords, evidenceFor, parseEnergyCsv, sortComparisons, toComparison } from '../data'

describe('energy data pipeline', () => {
  it('parses and validates the supplied dataset', () => {
    const records = parseEnergyCsv(rawCsv)
    expect(records).toHaveLength(15)
    expect(new Set(records.map((row) => row.country)).size).toBe(15)
    expect(Object.values(records[0].electricity).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 1)
  })

  it('derives fossil and non-fossil shares without a composite score', () => {
    const brazil = toComparison(energyRecords.find((row) => row.country === 'Brazil')!, 'business')
    expect(brazil.nonFossilElectricityPct).toBeCloseTo(89.45, 2)
    expect(brazil.fossilElectricityPct).toBeCloseTo(10.55, 2)
    expect(brazil.nonFossilElectricityPct + brazil.fossilElectricityPct).toBeCloseTo(100, 1)
    expect(brazil.selectedPriceUsd).toBe(0.158)
  })

  it('preserves Iranian missing prices as null and sorts them last', () => {
    const rows = energyRecords.map((row) => toComparison(row, 'household'))
    const iran = rows.find((row) => row.country === 'Iran')!
    expect(iran.selectedPriceUsd).toBeNull()
    expect(sortComparisons(rows, 'price').at(-1)?.country).toBe('Iran')
  })

  it('sorts each supported decision metric deterministically', () => {
    const rows = energyRecords.map((row) => toComparison(row, 'business'))
    expect(sortComparisons(rows, 'price')[0].country).toBe('Indonesia')
    expect(sortComparisons(rows, 'consumption')[0].country).toBe('China')
    expect(sortComparisons(rows, 'nonFossil')[0].country).toBe('France')
    expect(sortComparisons(rows, 'netImports')[0].country).toBe('China')
  })

  it('generates recommendations evidence from the current selection', () => {
    const rows = ['United States', 'Germany', 'Brazil', 'Indonesia'].map((country) => toComparison(energyRecords.find((row) => row.country === country)!, 'household'))
    const evidence = evidenceFor(rows)
    expect(evidence.lowest.country).toBe('Indonesia')
    expect(evidence.cleanest.country).toBe('Brazil')
    expect(evidence.mostExposed.country).toBe('Germany')
  })

  it('rejects a generation mix outside the 100 percent tolerance', () => {
    const broken = rawCsv.replace(',8.32,9.88,0.88,', ',80.32,9.88,0.88,')
    expect(() => parseEnergyCsv(broken)).toThrow(/Mix total/)
  })
})

