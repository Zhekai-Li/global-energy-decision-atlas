import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts'
import {
  DEFAULT_COUNTRIES, datasetMetadata, energyRecords, evidenceFor, sortComparisons,
  toComparison, type PriceAudience, type SortMetric,
} from './data'

const palette = ['#176b54', '#d36b3f', '#315f86', '#a78c3d']
const mixColors = {
  solar: '#e7b64b', wind: '#79a4a1', hydro: '#3478a0', other: '#7b6e9d',
  gas: '#cc7552', coal: '#4e514b', oilAndOtherFossil: '#99735a',
}

type DemoRole = 'Operations analyst' | 'Sustainability lead'
type Preferences = { countries: string[]; audience: PriceAudience; sort: SortMetric; role: DemoRole | null }
const storageKey = 'energy-atlas-preferences-v1'

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Partial<Preferences>
    const validCountries = saved.countries?.filter((country) => energyRecords.some((row) => row.country === country)).slice(0, 4)
    return {
      countries: validCountries?.length ? validCountries : DEFAULT_COUNTRIES,
      audience: saved.audience === 'business' ? 'business' : 'household',
      sort: ['price', 'consumption', 'nonFossil', 'netImports'].includes(saved.sort ?? '') ? saved.sort! : 'price',
      role: saved.role === 'Operations analyst' || saved.role === 'Sustainability lead' ? saved.role : null,
    }
  } catch {
    return { countries: DEFAULT_COUNTRIES, audience: 'household', sort: 'price', role: null }
  }
}

function formatPrice(value: number | null) {
  return value === null ? 'N/A' : `$${value.toFixed(3)}`
}

function downloadSelected(rows: ReturnType<typeof toComparison>[], audience: PriceAudience) {
  const header = ['country', `${audience}_price_usd_per_kwh`, 'total_energy_consumption_ej', 'non_fossil_electricity_pct', 'net_imports_ej', 'price_period', 'mix_year', 'trade_year']
  const lines = rows.map((row) => [row.country, row.selectedPriceUsd ?? '', row.totalConsumptionEj, row.nonFossilElectricityPct.toFixed(2), row.netImportsEj, row.pricePeriod, row.mixYear, row.tradeYear])
  const csv = [header, ...lines].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  link.download = `energy-atlas-${audience}-comparison.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

function CountryControls({ selected, onChange }: { selected: string[]; onChange: (countries: string[]) => void }) {
  const toggle = (country: string) => {
    if (selected.includes(country)) onChange(selected.filter((item) => item !== country))
    else if (selected.length < 4) onChange([...selected, country])
  }
  return (
    <fieldset className="country-picker">
      <legend>Countries <span>{selected.length}/4 selected</span></legend>
      <div className="country-options">
        {energyRecords.map((row) => {
          const checked = selected.includes(row.country)
          const disabled = !checked && selected.length >= 4
          return (
            <label className={checked ? 'selected' : ''} key={row.country}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(row.country)} />
              <span>{row.country}</span>
            </label>
          )
        })}
      </div>
      {selected.length === 0 && <p className="control-error" role="status">Select at least one country to populate the atlas.</p>}
    </fieldset>
  )
}

function MetricTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, number | string | null> }> }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="chart-tooltip">
      <strong>{row.country}</strong>
      {'price' in row && <span>{formatPrice(row.price as number | null)}/kWh</span>}
      {'nonFossil' in row && <span>{Number(row.nonFossil).toFixed(1)}% non-fossil</span>}
      {'consumption' in row && <span>{Number(row.consumption).toFixed(2)} EJ consumed</span>}
      {'netImports' in row && <span>{Number(row.netImports).toFixed(2)} EJ net imports</span>}
    </div>
  )
}

export default function App() {
  const initial = useMemo(loadPreferences, [])
  const [countries, setCountries] = useState(initial.countries)
  const [audience, setAudience] = useState<PriceAudience>(initial.audience)
  const [sort, setSort] = useState<SortMetric>(initial.sort)
  const [role, setRole] = useState<DemoRole | null>(initial.role)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingRole, setPendingRole] = useState<DemoRole>('Operations analyst')

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ countries, audience, sort, role }))
  }, [countries, audience, sort, role])

  const selected = useMemo(() => countries.map((country) => energyRecords.find((row) => row.country === country)!).filter(Boolean).map((row) => toComparison(row, audience)), [countries, audience])
  const sorted = useMemo(() => sortComparisons(selected, sort), [selected, sort])
  const evidence = selected.length ? evidenceFor(selected) : null
  const priced = selected.filter((row) => row.selectedPriceUsd !== null)
  const averagePrice = priced.length ? priced.reduce((sum, row) => sum + row.selectedPriceUsd!, 0) / priced.length : null
  const averageNonFossil = selected.length ? selected.reduce((sum, row) => sum + row.nonFossilElectricityPct, 0) / selected.length : null
  const importers = selected.filter((row) => row.netImportsEj > 0).length

  const scatterData = selected.filter((row) => row.selectedPriceUsd !== null).map((row) => ({
    country: row.country, price: row.selectedPriceUsd, nonFossil: row.nonFossilElectricityPct,
    consumption: row.totalConsumptionEj, z: Math.max(90, Math.sqrt(row.totalConsumptionEj) * 65),
  }))
  const mixData = selected.map((row) => ({ country: row.country, ...row.electricity }))
  const tradeData = selected.map((row) => ({ country: row.country, netImports: row.netImportsEj }))

  return (
    <div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Global Energy Decision Atlas home">
          <span className="brand-mark" aria-hidden="true">GE</span>
          <span>Global Energy<br />Decision Atlas</span>
        </a>
        <nav aria-label="Page navigation">
          <a href="#compare">Compare</a><a href="#findings">Findings</a><a href="#methodology">Methodology</a>
        </nav>
        {role ? (
          <button className="session-button" onClick={() => setRole(null)}><span className="status-dot" />{role}<small>Sign out</small></button>
        ) : <button className="session-button" onClick={() => setShowLogin(true)}>Start demo session</button>}
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero" id="top">
          <p className="eyebrow">Decision brief · 15 major energy markets</p>
          <h1>Compare the cost, electricity mix, and trade exposure behind an operating location.</h1>
          <div className="hero-grid">
            <p className="hero-copy">Built for business energy and sustainability teams screening national markets. Use it to identify tradeoffs worth investigating, then validate tariffs and contracts locally.</p>
            <div className="hero-note"><span>Scope</span><strong>2023–2025 reference data</strong><small>National totals, USD retail prices, generation shares, and net energy trade</small></div>
          </div>
        </section>

        <section className="controls-section" id="compare" aria-labelledby="controls-title">
          <div className="section-heading"><p>01 · Build a comparison</p><h2 id="controls-title">Choose up to four markets</h2></div>
          <div className="controls-panel">
            <CountryControls selected={countries} onChange={setCountries} />
            <fieldset className="segmented-control">
              <legend>Electricity price audience</legend>
              <div><label><input type="radio" name="audience" value="household" checked={audience === 'household'} onChange={() => setAudience('household')} /><span>Household</span></label>
              <label><input type="radio" name="audience" value="business" checked={audience === 'business'} onChange={() => setAudience('business')} /><span>Business</span></label></div>
              <p>USD per kWh, source display values for December 2025.</p>
            </fieldset>
            <label className="select-control">Sort comparison table
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMetric)}>
                <option value="price">Lowest price</option><option value="consumption">Highest consumption</option>
                <option value="nonFossil">Highest non-fossil share</option><option value="netImports">Largest net imports</option>
              </select>
            </label>
          </div>
        </section>

        {selected.length ? <>
          <section className="kpis" aria-label="Selected market summary">
            <article><span>Average {audience} price</span><strong>{formatPrice(averagePrice)}<small>/kWh</small></strong><p>{priced.length} of {selected.length} markets reported</p></article>
            <article><span>Average non-fossil electricity</span><strong>{averageNonFossil?.toFixed(1)}<small>%</small></strong><p>Generation share, not capacity</p></article>
            <article><span>Net energy importers</span><strong>{importers}<small>of {selected.length}</small></strong><p>Positive 2023 net imports</p></article>
            <article><span>Combined consumption</span><strong>{selected.reduce((sum, row) => sum + row.totalConsumptionEj, 0).toFixed(1)}<small>EJ</small></strong><p>Absolute national totals, 2024</p></article>
          </section>

          <section className="chart-section">
            <div className="chart-copy"><p>Cost and electricity mix</p><h2>Where low price meets a less fossil-intensive grid</h2><p>Each bubble is a selected country. Area indicates total national energy consumption, so large markets receive more visual weight without becoming a composite score.</p></div>
            <figure className="chart-card">
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid stroke="#d9d3c5" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="price" name="Price" unit=" USD/kWh" domain={[0, 'auto']} label={{ value: `${audience} USD/kWh`, position: 'insideBottom', offset: -18 }} />
                  <YAxis type="number" dataKey="nonFossil" name="Non-fossil" unit="%" domain={[0, 100]} label={{ value: 'Non-fossil electricity %', angle: -90, position: 'insideLeft' }} />
                  <ZAxis type="number" dataKey="z" range={[100, 850]} name="Consumption" />
                  <Tooltip content={<MetricTooltip />} />
                  <Scatter data={scatterData} fill="#176b54">
                    {scatterData.map((entry, index) => <Cell key={entry.country} fill={palette[index % palette.length]} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <figcaption>Price versus non-fossil electricity share. Iran is omitted because both retail price fields are missing.</figcaption>
            </figure>
          </section>

          <section className="chart-section reverse">
            <div className="chart-copy"><p>Electricity generation</p><h2>The source mix reveals very different transition starting points</h2><p>“Other” is the residual required for the seven displayed categories to total 100%. It includes nuclear and other renewables and should not be read as a single technology.</p></div>
            <figure className="chart-card">
              <ResponsiveContainer width="100%" height={390}>
                <BarChart data={mixData} layout="vertical" margin={{ top: 10, right: 20, bottom: 15, left: 34 }}>
                  <CartesianGrid stroke="#d9d3c5" horizontal={false} /><XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="country" width={92} tick={{ fontSize: 12 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="solar" stackId="mix" fill={mixColors.solar} name="Solar" />
                  <Bar dataKey="wind" stackId="mix" fill={mixColors.wind} name="Wind" />
                  <Bar dataKey="hydro" stackId="mix" fill={mixColors.hydro} name="Hydro" />
                  <Bar dataKey="other" stackId="mix" fill={mixColors.other} name="Other" />
                  <Bar dataKey="gas" stackId="mix" fill={mixColors.gas} name="Gas" />
                  <Bar dataKey="coal" stackId="mix" fill={mixColors.coal} name="Coal" />
                  <Bar dataKey="oilAndOtherFossil" stackId="mix" fill={mixColors.oilAndOtherFossil} name="Oil/other fossil" />
                </BarChart>
              </ResponsiveContainer>
              <figcaption>Share of domestic electricity generation in 2024. Percentages may differ slightly from 100 due to rounding.</figcaption>
            </figure>
          </section>

          <section className="chart-section">
            <div className="chart-copy"><p>Trade exposure</p><h2>Net imports separate reliance from production scale</h2><p>Positive values indicate net energy imports. Negative values indicate net exports. Gross flows and domestic production remain available in the detailed table.</p></div>
            <figure className="chart-card">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={tradeData} layout="vertical" margin={{ top: 10, right: 25, bottom: 15, left: 34 }}>
                  <CartesianGrid stroke="#d9d3c5" horizontal={false} /><XAxis type="number" unit=" EJ" />
                  <YAxis type="category" dataKey="country" width={92} tick={{ fontSize: 12 }} /><ReferenceLine x={0} stroke="#20251f" />
                  <Tooltip content={<MetricTooltip />} />
                  <Bar dataKey="netImports" name="Net imports">
                    {tradeData.map((entry) => <Cell key={entry.country} fill={entry.netImports >= 0 ? '#d36b3f' : '#176b54'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <figcaption>Total energy net imports in 2023, exajoules. Imports minus exports.</figcaption>
            </figure>
          </section>

          <section className="table-section" aria-labelledby="table-title">
            <div className="table-heading"><div><p>Detailed evidence</p><h2 id="table-title">Selected-market comparison</h2></div><button onClick={() => downloadSelected(sorted, audience)}>Download selected CSV</button></div>
            <div className="table-wrap"><table>
              <thead><tr><th>Country</th><th>{audience === 'household' ? 'Household' : 'Business'} price</th><th>Consumption</th><th>Non-fossil electricity</th><th>Net imports</th><th>Dates</th></tr></thead>
              <tbody>{sorted.map((row) => <tr key={row.country}>
                <th scope="row"><span className="country-swatch" style={{ background: palette[countries.indexOf(row.country) % palette.length] }} />{row.country}</th>
                <td>{formatPrice(row.selectedPriceUsd)}<small>USD/kWh</small></td><td>{row.totalConsumptionEj.toFixed(2)}<small>EJ</small></td>
                <td>{row.nonFossilElectricityPct.toFixed(2)}<small>% of generation</small></td>
                <td className={row.netImportsEj >= 0 ? 'import' : 'export'}>{row.netImportsEj > 0 ? '+' : ''}{row.netImportsEj.toFixed(2)}<small>EJ · {row.netImportDirection}</small></td>
                <td>{row.pricePeriod}<small>price</small><br />{row.mixYear}<small>mix</small><br />{row.tradeYear}<small>trade</small></td>
              </tr>)}</tbody>
            </table></div>
            <p className="table-note">N/A means the source did not report a value. Missing values remain excluded from price calculations and are never treated as zero.</p>
          </section>

          <section className="findings" id="findings">
            <div className="section-heading light"><p>02 · Read the evidence</p><h2>Findings within this selection</h2></div>
            {evidence && <div className="finding-grid">
              <article><span>Lowest reported {audience} price</span><strong>{evidence.lowest?.country ?? 'No reported prices'}</strong><p>{evidence.lowest ? `${formatPrice(evidence.lowest.selectedPriceUsd)}/kWh in ${evidence.lowest.pricePeriod}` : 'The selected countries have no reported price values.'}</p></article>
              <article><span>Highest non-fossil share</span><strong>{evidence.cleanest.country}</strong><p>{evidence.cleanest.nonFossilElectricityPct.toFixed(1)}% of 2024 generation, including the residual “other” category.</p></article>
              <article><span>Largest net importer</span><strong>{evidence.mostExposed.country}</strong><p>{evidence.mostExposed.netImportsEj.toFixed(2)} EJ in 2023. This indicates trade direction, not supply reliability.</p></article>
            </div>}
            <div className="recommendations"><h3>How to use this screen</h3>
              <ol><li><strong>Shortlist on cost and mix together.</strong> A low retail price can coexist with a fossil-heavy grid. Carry both criteria into site screening.</li>
              <li><strong>Stress-test import exposure.</strong> For net importers, evaluate contract terms, fuel sensitivity, and continuity plans before committing capital.</li>
              <li><strong>Validate at facility level.</strong> Request current industrial tariffs, time-of-use rules, demand charges, and renewable procurement options in each shortlisted location.</li></ol>
            </div>
          </section>
        </> : <section className="empty-state"><h2>No markets selected</h2><p>Choose at least one country above to show the comparison.</p></section>}

        <section className="methodology" id="methodology">
          <div className="section-heading"><p>03 · Understand the boundaries</p><h2>Methodology and limitations</h2></div>
          <div className="method-grid">
            <article><h3>Derived measures</h3><p><strong>Non-fossil electricity</strong> equals solar + wind + hydro + other. <strong>Fossil electricity</strong> equals gas + coal + oil and other fossil. <strong>Net imports</strong> equal gross imports minus gross exports.</p></article>
            <article><h3>Reference periods</h3><p>Consumption and electricity mix use 2024 data; total energy trade uses 2023 data; retail prices are displayed for December 2025. Mixed dates prevent a same-period causal comparison.</p></article>
            <article><h3>Scope and uncertainty</h3><p>The 15 countries are a comparison set, not a global census. Consumption is an absolute national total, not per capita. USD prices inherit source exchange-rate uncertainty. Iran has no reported retail price.</p></article>
            <article><h3>Interpretation</h3><p>Cross-sectional patterns support screening and question formation. They cannot prove that a generation mix causes a price or that net imports predict reliability, resilience, or future costs.</p></article>
          </div>
          <div className="sources"><h3>Sources and definitions</h3><p>The supplied 49-column dataset combines retail prices from GlobalPetrolPrices, national consumption from Worldometer, electricity mix from Our World in Data/Ember, total energy trade from IEA balances, and electricity trade from EIA. Links below open the dataset’s cited source pages.</p>
            <div className="source-links"><a href={energyRecords[0].mixSourceUrl} target="_blank" rel="noreferrer">Mix data</a><a href={energyRecords[0].mixDefinitionsUrl} target="_blank" rel="noreferrer">Mix codebook</a><a href={energyRecords[0].consumptionSourceUrl} target="_blank" rel="noreferrer">Consumption</a><a href={energyRecords[0].totalEnergyTradeSourceUrl} target="_blank" rel="noreferrer">Total energy trade</a><a href={energyRecords[0].electricityTradeSourceUrl} target="_blank" rel="noreferrer">Electricity trade</a><a href={datasetMetadata.sourceUrl} target="_blank" rel="noreferrer">Supplied CSV</a></div>
            <p className="provenance">Dataset accessed {datasetMetadata.accessedDate} · {datasetMetadata.rows} rows × {datasetMetadata.columns} columns · SHA-256 {datasetMetadata.sha256}</p>
          </div>
        </section>
      </main>

      <footer><span>Global Energy Decision Atlas</span><p>Static decision-support prototype. No personal data, analytics, or remote runtime data requests.</p><a href="#top">Back to top</a></footer>

      {showLogin && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowLogin(false) }}>
        <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button className="dialog-close" aria-label="Close demo session dialog" onClick={() => setShowLogin(false)}>×</button>
          <p className="eyebrow">Optional demo</p><h2 id="login-title">Choose a working role</h2>
          <p>This is not real authentication. The atlas stores only your role and dashboard preferences in this browser. It never asks for personal data.</p>
          <fieldset><legend>Role</legend><label><input type="radio" name="role" checked={pendingRole === 'Operations analyst'} onChange={() => setPendingRole('Operations analyst')} /> Operations analyst</label><label><input type="radio" name="role" checked={pendingRole === 'Sustainability lead'} onChange={() => setPendingRole('Sustainability lead')} /> Sustainability lead</label></fieldset>
          <button className="primary" onClick={() => { setRole(pendingRole); setShowLogin(false) }}>Start demo session</button>
        </div>
      </div>}
    </div>
  )
}
