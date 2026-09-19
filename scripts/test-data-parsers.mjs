import assert from 'node:assert/strict'
import test from 'node:test'
import { closestRow, parsePublicPriceTable, selectCoverageYear } from './lib/expanded-source-parsers.mjs'

const priceFixture = `<h1>Residential and Business Electricity Prices by Country (2023-2026 averages)</h1>
<tr><td><a href="/USA/electricity_prices/">USA</a></td><td>0.188</td><td>0.149</td></tr>
<tr><td><a href="/Iran/electricity_prices/">Iran</a></td><td></td><td></td></tr>`

test('parses public price rows and preserves blanks', () => {
  const parsed = parsePublicPriceTable(priceFixture, 2)
  assert.deepEqual(parsed.get('USA'), { household: 0.188, business: 0.149 })
  assert.deepEqual(parsed.get('Iran'), { household: null, business: null })
})

test('fails when the public price heading changes', () => {
  assert.throws(() => parsePublicPriceTable(priceFixture.replace('2023-2026 averages','latest averages'), 2), /heading changed/)
})

test('selects the latest coverage year and limits fallback to two years', () => {
  const rows = [
    { iso_code:'AAA',year:'2024',value:'1' }, { iso_code:'BBB',year:'2024',value:'' },
    { iso_code:'AAA',year:'2023',value:'1' }, { iso_code:'BBB',year:'2023',value:'2' },
    { iso_code:'BBB',year:'2020',value:'3' },
  ]
  assert.equal(selectCoverageYear(rows,['AAA','BBB'],['value'],.9),2023)
  assert.equal(closestRow(rows,'BBB',2024,['value']).year,'2023')
  assert.equal(closestRow(rows,'BBB',2023,['missing']),null)
})
