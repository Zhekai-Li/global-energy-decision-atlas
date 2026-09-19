import { describe, expect, it } from 'vitest'
import rawExpanded from '../../data/expanded-energy-50-v1.csv?raw'
import { parseExpandedCsv } from '../data-v2'
import { correlationStrength, deriveSelectionInsights, pearson } from '../insights'
import { DEFAULT_STATE } from '../state'
import type { AtlasRecord, DashboardState } from '../types'

const records = parseExpandedCsv(rawExpanded)

function stateFor(scope: AtlasRecord[], patch: Partial<DashboardState> = {}): DashboardState {
  return {
    ...DEFAULT_STATE,
    selectionMode: 'countries',
    countryCodes: scope.map((record) => record.iso3),
    focusCountryCodes: scope.slice(0, 8).map((record) => record.iso3),
    ...patch,
  }
}

function derive(scope: AtlasRecord[], patch: Partial<DashboardState> = {}, dataset = records, display = scope.slice(0, 8)) {
  return deriveSelectionInsights({ state: stateFor(scope, patch), datasetRecords: dataset, scopeRecords: scope, displayRecords: display })
}

describe('selection insight calculations', () => {
  it('requires five complete pairs and uses the locked correlation bands', () => {
    expect(pearson([[1, 1], [2, 2], [3, 3], [4, 4]])).toBeNull()
    expect(correlationStrength(.19)).toBe('little')
    expect(correlationStrength(-.2)).toBe('weak')
    expect(correlationStrength(.4)).toBe('moderate')
    expect(correlationStrength(-.6)).toBe('strong')
    expect(correlationStrength(.8)).toBe('veryStrong')
  })

  it('uses a small-scope comparison for a single country', () => {
    const insights = derive([records[0]])
    expect(insights).toHaveLength(4)
    expect(insights.find((item) => item.id === 'concentration')?.titleKey).toBe('insights.concentration.percentileTitle')
    expect(insights.find((item) => item.id === 'tradeoff')?.values.correlation).toBe('insufficient')
  })

  it('benchmarks the complete Expanded 50 selection without mixing scopes', () => {
    const insights = derive(records)
    const benchmark = insights[0]
    const confidence = insights.find((item) => item.id === 'confidence')!
    expect(benchmark.metric).toBe('price')
    expect(confidence.values.total).toBe(50)
    expect(confidence.values.reported).toBeGreaterThanOrEqual(45)
    expect(insights.find((item) => item.id === 'tradeoff')?.coverage.complete).toBeGreaterThanOrEqual(40)
  })

  it('reports missing values and fallbacks in confidence coverage', () => {
    const fallback: AtlasRecord = { ...records[0], householdPrice: { ...records[0].householdPrice, isFallback: true } }
    const missing: AtlasRecord = { ...records[1], householdPrice: { ...records[1].householdPrice, value: null, period: null, isFallback: false } }
    const confidence = derive([fallback, missing], {}, [fallback, missing]).find((item) => item.id === 'confidence')!
    expect(confidence.tone).toBe('watch')
    expect(confidence.values).toMatchObject({ reported: 1, total: 2, fallback: 1, missing: 1 })
    expect(confidence.coverage).toMatchObject({ complete: 1, total: 2, entityKind: 'markets' })
  })

  it('keeps the two trade definitions explicitly distinct', () => {
    const assignment = records.slice(0, 5).map((record) => ({ ...record, datasetScope: 'assignment-15' as const }))
    const assignmentSignal = derive(assignment, { datasetScope: 'assignment-15', mapMetric: 'tradeExposure' }, assignment)[0]
    const expandedSignal = derive(records.slice(0, 5), { mapMetric: 'tradeExposure' })[0]
    expect(assignmentSignal.titleKey).toBe('insights.benchmark.tradeAssignment.title')
    expect(expandedSignal.titleKey).toBe('insights.benchmark.tradeExpanded.title')
  })

  it('switches the current signal across all four map metrics', () => {
    for (const metric of ['price', 'nonFossil', 'consumption', 'tradeExposure'] as const) {
      expect(derive(records.slice(0, 10), { mapMetric: metric })[0].metric).toBe(metric)
    }
  })

  it('uses deduplicated scope records and flags overlapping region membership', () => {
    const scope = [records[0], records[0], ...records.slice(1, 8)]
    const state = stateFor(scope, { selectionMode: 'regions', regionIds: ['europe', 'nordics'] })
    const insights = deriveSelectionInsights({ state, datasetRecords: records, scopeRecords: scope, displayRecords: records.slice(0, 2) })
    const confidence = insights.find((item) => item.id === 'confidence')!
    expect(confidence.values.total).toBe(8)
    expect(Number(confidence.values.overlap)).toBeGreaterThan(0)
  })

  it('uses regional aggregates as the coverage entity in aggregate mode', () => {
    const scope = records.slice(0, 12)
    const members = derive(scope, { regionDisplayMode: 'members' }, records, scope.slice(0, 8))
    const aggregate = derive(scope, { selectionMode: 'regions', regionDisplayMode: 'aggregate' }, records, [scope[0]])
    expect(members.find((item) => item.id === 'tradeoff')?.coverage).toMatchObject({ total: 12, entityKind: 'markets' })
    expect(aggregate.find((item) => item.id === 'tradeoff')?.coverage).toMatchObject({ total: 1, entityKind: 'regionalAggregates' })
  })
})
