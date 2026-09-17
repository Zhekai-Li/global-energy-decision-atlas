const fs = require('fs')
const path = require('path')
const PptxGenJS = require('pptxgenjs')
const sharp = require('sharp')
const html2pptx = require('/Users/zhekaili/.codex/skills/powerpoint/scripts/html2pptx.js')

const root = path.resolve(__dirname, '..')
const tmp = path.join(root, 'tmp', 'deck-build')
const out = path.join(root, 'artifacts', 'global-energy-atlas-presentation.pptx')
fs.mkdirSync(tmp, { recursive: true })

const C = { cream: '#F3EFE4', paper: '#FAF8F1', ink: '#20251F', green: '#176B54', orange: '#D36B3F', blue: '#315F86', gold: '#A78C3D', line: '#CFC8B8', muted: '#666B64' }
const css = `
*{box-sizing:border-box} html,body{margin:0;padding:0} body{width:720pt;height:405pt;background:${C.cream};color:${C.ink};font-family:Arial,sans-serif;display:flex;position:relative;overflow:hidden}
.slide{width:100%;height:100%;padding:34pt 42pt 28pt;display:flex;flex-direction:column;position:relative}
.dark{background:#1E2924;color:#F7F3E9}.kicker{font-size:8pt;letter-spacing:1.5pt;text-transform:uppercase;color:${C.green};font-weight:700;margin:0 0 10pt}.dark .kicker{color:#8FC9B7}
h1{font-family:Georgia,serif;font-weight:400;font-size:36pt;line-height:1.02;letter-spacing:-1.2pt;margin:0} h2{font-family:Georgia,serif;font-weight:400;font-size:27pt;line-height:1.05;letter-spacing:-.6pt;margin:0} h3{font-size:12pt;line-height:1.2;margin:0 0 6pt} p{font-size:11pt;line-height:1.38;margin:0}.small{font-size:8.5pt;line-height:1.35;color:${C.muted}}.dark .small{color:#C8D0CB}
.footer{position:absolute;left:42pt;right:42pt;bottom:14pt;border-top:1px solid ${C.line};padding-top:6pt;display:flex;justify-content:space-between}.footer p{font-size:6.5pt;letter-spacing:.7pt;text-transform:uppercase;color:${C.muted}}.dark .footer{border-color:#53615A}.dark .footer p{color:#A9B3AD}
.two{display:flex;gap:34pt;align-items:flex-start}.col{flex:1}.rule{height:1px;background:${C.line};width:100%;margin:17pt 0}.metric{font-family:Georgia,serif;font-size:34pt;margin:0 0 2pt;color:${C.green}}.dark .metric{color:#F7F3E9}.caption{font-size:7pt;text-transform:uppercase;letter-spacing:1pt;color:${C.muted};margin:0 0 5pt}.body{font-size:10.5pt;line-height:1.42}.placeholder{background:${C.paper};border:1px solid ${C.line}}
`

function footer(n, dark=false) {
  return `<div class="footer"><p>Global Energy Decision Atlas</p><p>${String(n).padStart(2,'0')} / 06</p></div>`
}
function html(body, extra='') { return `<!doctype html><html><head><style>${css}${extra}</style></head><body>${body}</body></html>` }
async function writeSlide(n, body, extra='') {
  const file = path.join(tmp, `slide-${n}.html`)
  fs.writeFileSync(file, html(body, extra))
  return file
}

async function build() {
  const shot = path.join(tmp, 'atlas-workflow.png')
  await sharp(path.join(root, 'tmp', 'site-qa', 'desktop.png')).extract({ left: 0, top: 0, width: 1280, height: 2650 }).resize({ width: 1200 }).png().toFile(shot)

  const files = []
  files.push(await writeSlide(1, `<div class="slide">
    <p class="kicker">Five-minute decision demonstration</p>
    <h1 style="width:590pt;margin-top:46pt;font-size:43pt">Global Energy</h1>
    <h1 style="width:590pt;margin-top:7pt;font-size:43pt">Decision Atlas</h1>
    <p style="width:455pt;margin-top:25pt;font-size:15pt;line-height:1.35">Comparing operating cost, electricity sources, and energy trade exposure across 15 countries</p>
    <div style="position:absolute;left:42pt;bottom:54pt;width:280pt;border-left:4pt solid ${C.green};padding-left:14pt"><p class="small">For business energy and sustainability teams screening national markets</p></div>
    ${footer(1)}
  </div>`))

  files.push(await writeSlide(2, `<div class="slide">
    <p class="kicker">Data and method</p><h2>One supplied dataset, four decision lenses</h2>
    <div class="two" style="margin-top:24pt">
      <div class="col"><p class="metric">15</p><p class="caption">countries</p><p class="body">Major energy consumers form a focused comparison set rather than a global census.</p></div>
      <div class="col"><p class="metric">49</p><p class="caption">documented fields</p><p class="body">Prices, consumption, generation sources, production, imports, exports, dates, units, and source URLs.</p></div>
      <div class="col"><p class="metric">0</p><p class="caption">runtime data requests</p><p class="body">The unchanged CSV is validated and bundled with the static site.</p></div>
    </div>
    <div class="rule"></div>
    <div style="display:flex;gap:17pt">
      <div style="flex:1"><h3>2023</h3><p class="small">Total energy production and cross-border trade</p></div>
      <div style="flex:1"><h3>2024</h3><p class="small">Total consumption and domestic electricity generation mix</p></div>
      <div style="flex:1"><h3>December 2025</h3><p class="small">Household and business retail electricity prices</p></div>
      <div style="flex:1"><h3>Missing values</h3><p class="small">Iranian prices display as N/A and never become zero</p></div>
    </div>${footer(2)}
  </div>`))

  files.push(await writeSlide(3, `<div class="slide">
    <p class="kicker">Dashboard workflow</p><h2>Build a shortlist, inspect the tradeoffs, export the evidence</h2>
    <div style="display:flex;gap:28pt;margin-top:20pt;align-items:center">
      <div style="width:382pt;height:254pt;overflow:hidden;border:1px solid ${C.line};background:white"><img src="file://${shot}" style="width:382pt;height:254pt;object-fit:cover;object-position:top"></div>
      <div style="flex:1">
        <div style="border-top:1px solid ${C.line};padding:12pt 0"><p class="caption">01 Compare</p><p class="body">Choose up to four countries and switch between household and business prices.</p></div>
        <div style="border-top:1px solid ${C.line};padding:12pt 0"><p class="caption">02 Interpret</p><p class="body">Read cost, mix, demand, and trade together. No composite score hides the tradeoffs.</p></div>
        <div style="border-top:1px solid ${C.line};padding:12pt 0"><p class="caption">03 Continue</p><p class="body">Download the selected comparison for facility-level diligence.</p></div>
      </div>
    </div>${footer(3)}
  </div>`, `img{display:block}`))

  files.push(await writeSlide(4, `<div class="slide">
    <p class="kicker">Findings from the default comparison</p><h2>The four markets show no single best profile</h2>
    <div style="display:flex;gap:18pt;margin-top:22pt">
      <div style="flex:1"><p class="caption">Household electricity price  USD per kWh</p><div id="price" class="placeholder" style="width:300pt;height:230pt"></div></div>
      <div style="flex:1"><p class="caption">Non-fossil electricity generation  percent</p><div id="mix" class="placeholder" style="width:300pt;height:230pt"></div></div>
    </div>
    <p class="small" style="margin-top:9pt">Indonesia reports the lowest household price in the selection. Brazil reports the highest non-fossil generation share. Germany is the only net importer among the four.</p>
    ${footer(4)}
  </div>`))

  files.push(await writeSlide(5, `<div class="slide dark">
    <p class="kicker">Recommendations</p><h2 style="width:560pt">Treat the atlas as a screening tool before local diligence</h2>
    <div style="margin-top:24pt">
      <div style="display:flex;border-top:1px solid #53615A;padding:16pt 0"><p style="width:55pt;color:#8FC9B7;font-family:Georgia,serif;font-size:16pt">01</p><div><h3>Shortlist on cost and generation mix together</h3><p class="small">A low retail price can coexist with a fossil-heavy grid. Carry both measures into the site screen.</p></div></div>
      <div style="display:flex;border-top:1px solid #53615A;padding:16pt 0"><p style="width:55pt;color:#8FC9B7;font-family:Georgia,serif;font-size:16pt">02</p><div><h3>Stress-test import exposure</h3><p class="small">For net importers, assess contract terms, fuel sensitivity, and continuity plans before committing capital.</p></div></div>
      <div style="display:flex;border-top:1px solid #53615A;padding:16pt 0"><p style="width:55pt;color:#8FC9B7;font-family:Georgia,serif;font-size:16pt">03</p><div><h3>Validate the facility tariff</h3><p class="small">Request current industrial rates, demand charges, time-of-use rules, and renewable procurement options.</p></div></div>
    </div>${footer(5,true)}
  </div>`))

  files.push(await writeSlide(6, `<div class="slide">
    <p class="kicker">Limitations and reflection</p><h2>Cross-sectional evidence narrows questions. It does not prove causes.</h2>
    <div class="two" style="margin-top:25pt">
      <div class="col"><h3>What the data supports</h3><p class="body">The atlas identifies differences in reported prices, source shares, absolute demand, and trade direction. It helps teams choose where to investigate further.</p><div class="rule"></div><h3>What it cannot establish</h3><p class="body">It cannot show why prices differ, predict future tariffs, rank supply reliability, or prove that generation mix causes retail prices.</p></div>
      <div class="col" style="border-left:1px solid ${C.line};padding-left:28pt"><h3>Important boundaries</h3><p class="body">Reference years differ. Consumption is not per capita. USD prices carry exchange-rate uncertainty. Iran lacks prices. “Other” combines nuclear and other renewables.</p><div class="rule"></div><p style="font-family:Georgia,serif;font-size:18pt;line-height:1.28">Use the comparison to form a shortlist, then verify the actual site.</p></div>
    </div>${footer(6)}
  </div>`))

  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_16x9'
  pptx.author = 'Global Energy Decision Atlas'
  pptx.subject = 'Five-minute energy market decision demonstration'
  pptx.title = 'Global Energy Decision Atlas'
  pptx.company = 'Course project'
  pptx.lang = 'en-US'
  pptx.theme = { headFontFace: 'Georgia', bodyFontFace: 'Arial', lang: 'en-US' }

  for (let i = 0; i < files.length; i++) {
    const { slide, placeholders } = await html2pptx(files[i], pptx, { tmpDir: tmp })
    const noteBase = 'Source: supplied energy-data.csv, accessed 17 September 2026. Dataset source URLs are retained in the repository.'
    slide.addNotes(i === 3 ? noteBase + ' Household prices: United States 0.203, Germany 0.399, Brazil 0.180, Indonesia 0.082 USD/kWh. Non-fossil electricity: 41.88%, 58.64%, 89.45%, and 18.09%, respectively.' : noteBase)
    if (i === 3) {
      const price = placeholders.find(p => p.id === 'price')
      const mix = placeholders.find(p => p.id === 'mix')
      const labels = ['United States', 'Germany', 'Brazil', 'Indonesia']
      const common = {
        showLegend: false, showTitle: false, showValue: true, showCatName: false,
        chartColors: ['176B54'], showCatAxisTitle: false, showValAxisTitle: false,
        catAxisLabelFontFace: 'Arial', catAxisLabelFontSize: 9,
        valAxisLabelFontFace: 'Arial', valAxisLabelFontSize: 8,
        dataLabelColor: '20251F', dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.000',
        showValue: true, showCategoryName: false, showSerName: false,
        showBorder: false, showValAxisLine: true, showCatAxisLine: true,
        valGridLine: { color: 'D9D3C5', width: 1 },
      }
      slide.addChart(pptx.ChartType.bar, [{ name: 'Household price', labels, values: [0.203, 0.399, 0.180, 0.082] }], { ...price, ...common, valAxisMinVal: 0, valAxisMaxVal: 0.45, valAxisMajorUnit: 0.1, catAxisLabelPos: 'low' })
      slide.addChart(pptx.ChartType.bar, [{ name: 'Non-fossil share', labels, values: [41.88, 58.64, 89.45, 18.09] }], { ...mix, ...common, chartColors: ['315F86'], dataLabelFormatCode: '0.0', valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25, catAxisLabelPos: 'low' })
    }
  }
  await pptx.writeFile({ fileName: out })
  console.log(out)
}

build().catch(err => { console.error(err); process.exit(1) })
