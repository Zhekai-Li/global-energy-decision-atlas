import { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Graticule, ZoomableGroup } from 'react-simple-maps'
import world from 'world-atlas/countries-110m.json'
import { useTranslation } from 'react-i18next'
import { metricValue } from '../state'
import type { AtlasRecord, DashboardState, MetricValue } from '../types'

const geoAliases: Record<string, string> = {
  'United States of America': 'USA', 'United States': 'USA', 'United Kingdom': 'GBR', Russia: 'RUS',
  'South Korea': 'KOR', Korea: 'KOR', Vietnam: 'VNM', 'United Arab Emirates': 'ARE', Iran: 'IRN',
  Tanzania: 'TZA', 'Dem. Rep. Congo': 'COD', 'Central African Rep.': 'CAF', 'Dominican Rep.': 'DOM',
}

function color(value: number | null, values: number[], diverging: boolean) {
  if (value === null) return 'url(#missing-pattern)'
  if (diverging) {
    const max = Math.max(...values.map(Math.abs), 0.001)
    const ratio = Math.min(Math.abs(value) / max, 1)
    return value < 0
      ? `color-mix(in srgb, var(--map-export) ${28 + ratio * 68}%, var(--map-neutral))`
      : `color-mix(in srgb, var(--map-import) ${28 + ratio * 68}%, var(--map-neutral))`
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const ratio = max === min ? .6 : (value - min) / (max - min)
  return `color-mix(in srgb, var(--map-sequential) ${18 + ratio * 78}%, var(--map-neutral))`
}

function countryLabel(record: AtlasRecord, locale: string) {
  try { return new Intl.DisplayNames([locale], { type: 'region' }).of(record.iso3) ?? record.country } catch { return record.country }
}

function metricDetails(record: AtlasRecord, state: DashboardState): MetricValue {
  if (state.mapMetric === 'price') return state.priceAudience === 'household' ? record.householdPrice : record.businessPrice
  if (state.mapMetric === 'nonFossil') return {
    value: metricValue(record, 'nonFossil', state.priceAudience), unit: '%', period: record.electricityGeneration.period,
    sourceId: record.electricityGeneration.sourceId, method: 'derived', isFallback: record.electricityGeneration.isFallback,
  }
  return record[state.mapMetric]
}

export function WorldMap({ records, scopeCodes, focusCodes, state, onCountry }: { records: AtlasRecord[]; scopeCodes: string[]; focusCodes: string[]; state: DashboardState; onCountry: (code: string) => void }) {
  const { t, i18n } = useTranslation()
  const [inspected, setInspected] = useState<AtlasRecord | null>(null)
  const [zoom, setZoom] = useState(1)
  const recordByName = useMemo(() => new Map(records.flatMap((record) => [[record.country, record], ...(Object.entries(geoAliases).filter(([, code]) => code === record.iso3).map(([name]) => [name, record] as const))])), [records])
  const values = records.map((record) => metricValue(record, state.mapMetric, state.priceAudience)).filter((value): value is number => value !== null)
  const format = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: state.mapMetric === 'price' ? 3 : 1, minimumFractionDigits: state.mapMetric === 'price' ? 3 : 1 })
  const unit = state.mapMetric === 'price' ? 'USD/kWh' : state.mapMetric === 'nonFossil' ? '%' : 'EJ'
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const diverging = state.mapMetric === 'tradeExposure'
  const inspectedMetric = inspected ? metricDetails(inspected, state) : null
  const formatLegend = (value: number) => `${format.format(value)} ${unit}`

  return <section className="map-card" id="map" aria-labelledby="map-title">
    <div className="card-heading map-heading"><div><p className="eyebrow">{t(`metrics.${state.mapMetric}`)}</p><h2 id="map-title">{t('atlas.mapTitle')}</h2><p className="map-instruction">{t('atlas.mapHint')}</p></div></div>
    <div className="map-stage">
      <div className="map-tools map-tools-overlay" aria-label={t('atlas.mapControls')}><button onClick={() => setZoom(Math.min(6, zoom * 1.5))} aria-label={t('atlas.zoomIn')}>+</button><button onClick={() => setZoom(Math.max(1, zoom / 1.5))} aria-label={t('atlas.zoomOut')}>−</button><button onClick={() => setZoom(1)}>{t('atlas.resetMap')}</button></div>
      <ComposableMap projectionConfig={{ scale: 145 }} aria-label={t('atlas.mapTitle')}>
        <title>{t('atlas.mapTitle')}</title><desc>{t('atlas.mapHint')}</desc>
        <defs><pattern id="missing-pattern" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="var(--map-missing)"/><line x1="0" y1="0" x2="0" y2="7" stroke="var(--map-missing-line)" strokeWidth="2"/></pattern><filter id="focus-glow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="var(--map-focus)" floodOpacity=".55"/></filter></defs>
        <ZoomableGroup zoom={zoom} onMoveEnd={({ zoom: next }) => setZoom(next ?? 1)}>
          <Graticule fill="transparent" stroke="var(--map-graticule)" strokeWidth={.35} />
          <Geographies geography={world as never}>{({ geographies }) => geographies.map((geo) => {
            const record = recordByName.get(String(geo.properties?.name ?? ''))
            const selected = record ? scopeCodes.includes(record.iso3) : false
            const focused = record ? focusCodes.includes(record.iso3) : false
            const value = record ? metricValue(record, state.mapMetric, state.priceAudience) : null
            return <Geography key={geo.rsmKey} geography={geo} tabIndex={record ? 0 : -1} className={`map-country${selected ? ' is-scope' : ''}${focused ? ' is-focus' : ''}`}
              aria-label={record ? `${countryLabel(record, i18n.language)}: ${value === null ? t('atlas.noData') : `${format.format(value)} ${unit}`}` : undefined}
              onClick={() => record && onCountry(record.iso3)} onKeyDown={(event) => { if (record && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onCountry(record.iso3) } }}
              onMouseEnter={() => setInspected(record ?? null)} onMouseLeave={() => setInspected(null)} onFocus={() => setInspected(record ?? null)} onBlur={() => setInspected(null)}
              fill={record ? color(value, values, diverging) : 'var(--map-background)'} stroke={focused ? 'var(--map-focus)' : selected ? 'var(--map-scope)' : 'var(--map-border)'}
              strokeDasharray={selected && !focused ? '3 2' : undefined} strokeWidth={focused ? 2.1 : selected ? 1.15 : .4} vectorEffect="non-scaling-stroke" filter={focused ? 'url(#focus-glow)' : undefined} />
          })}</Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className={`map-inspector${inspected ? '' : ' is-empty'}`} aria-live="polite">{inspected && inspectedMetric ? <><div><span>{inspected.iso3}</span><strong>{countryLabel(inspected, i18n.language)}</strong></div><b>{inspectedMetric.value === null ? t('atlas.noData') : `${format.format(inspectedMetric.value)} ${unit}`}</b><dl><div><dt>{t('atlas.period')}</dt><dd>{inspectedMetric.period ?? t('common.notAvailable')}</dd></div><div><dt>{t('atlas.source')}</dt><dd>{inspectedMetric.sourceId}</dd></div></dl></> : <><span className="inspector-kicker">{t('atlas.mapHintTitle')}</span><p>{t('atlas.mapHint')}</p></>}</div>
    </div>
    <div className="map-legend-panel" role="group" aria-label={t('atlas.mapLegend')}>
      <div className="legend-scale"><div className="legend-title"><strong>{t(`metrics.${state.mapMetric}`)}</strong><span>{unit}</span></div><div className={`legend-gradient ${diverging ? 'diverging' : 'sequential'}`} /><div className="legend-values"><span>{formatLegend(diverging ? -Math.max(Math.abs(min), Math.abs(max)) : min)}</span><span>{diverging ? `0 ${unit}` : formatLegend((min + max) / 2)}</span><span>{formatLegend(diverging ? Math.max(Math.abs(min), Math.abs(max)) : max)}</span></div>{diverging && <div className="legend-direction"><span>{t('atlas.legendNegative')}</span><span>{t('atlas.legendPositive')}</span></div>}</div>
      <div className="legend-keys"><span><i className="legend-outline scope" />{t('atlas.legendScope')}</span><span><i className="legend-outline focus" />{t('atlas.legendFocus')}</span><span><i className="legend-swatch missing" />{t('atlas.legendMissing')}</span></div>
    </div>
    <details className="country-equivalent"><summary>{t('atlas.keyboardList')}</summary><div>{records.map((record) => <button key={record.iso3} className={`${scopeCodes.includes(record.iso3) ? 'selected' : ''}${focusCodes.includes(record.iso3) ? ' focused' : ''}`} onClick={() => onCountry(record.iso3)}><span>{countryLabel(record, i18n.language)}</span><small>{metricValue(record, state.mapMetric, state.priceAudience) === null ? t('atlas.noData') : `${format.format(metricValue(record, state.mapMetric, state.priceAudience)!)} ${unit}`}</small></button>)}</div></details>
  </section>
}
