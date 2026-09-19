import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const root = process.env.ATLAS_WORKSPACE_ROOT
  ? path.resolve(process.env.ATLAS_WORKSPACE_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillDir = process.env.PRESENTATIONS_SKILL_DIR ?? "/Users/zhekaili/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const artifactToolPath = process.env.ARTIFACT_TOOL_MODULE ?? "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const runtimePython = process.env.RUNTIME_PYTHON ?? "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3.12";
const runtimeNode = process.env.RUNTIME_NODE ?? "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
const runtimeNodeModules = process.env.RUNTIME_NODE_MODULES ?? "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const runtimeBinDir = process.env.RUNTIME_BIN_DIR ?? "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override";
const soffice = process.env.SOFFICE_BIN ?? "/opt/homebrew/bin/soffice";
const shots = path.join(root, "tmp", "site-screenshots");
const buildDir = path.join(root, "tmp", "presentation-build");
const outputDir = path.join(root, "tmp", "presentation-output");
const stagingDir = path.join(root, ".codex-finalizer");
const buildId = Date.now();
const pdfDir = path.join(outputDir, `pdf-${buildId}`);

process.env.RUNTIME_NODE = runtimeNode;
process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
process.env.RUNTIME_BIN_DIR = runtimeBinDir;
process.env.RUNTIME_PYTHON = runtimePython;

const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);

await Promise.all([
  fs.mkdir(buildDir, { recursive: true }),
  fs.mkdir(outputDir, { recursive: true }),
  fs.mkdir(pdfDir, { recursive: true }),
  fs.mkdir(stagingDir, { recursive: true }),
  fs.mkdir(path.join(root, "artifacts"), { recursive: true }),
]);

const analysisSummary = JSON.parse(await fs.readFile(path.join(root, "artifacts", "analysis-summary.json"), "utf8"));
const storyPresets = JSON.parse(await fs.readFile(path.join(root, "data", "story-presets.json"), "utf8"));
const deliverableManifest = JSON.parse(await fs.readFile(path.join(root, "data", "deliverables.json"), "utf8"));
const evidenceBoundaries = analysisSummary.evidenceBoundaries;
const expanded = analysisSummary.expanded50;
const stories = expanded.stories;
const deliverableCount = deliverableManifest.groups.flatMap((group) => group.files).length;

for (const id of ["europe-price-peak", "ethiopia-price-structure", "china-us-consumption", "energy-balance-split"]) {
  if (!storyPresets.some((preset) => preset.id === id)) throw new Error(`Missing story preset: ${id}`);
}

const family = "Arial";
const C = {
  cream: "#F1EEE6", paper: "#FBF9F3", ink: "#17201C", green: "#087F5B",
  blue: "#27779B", rust: "#C9583C", muted: "#59645D", white: "#FFFFFF",
  dark: "#07131A", line: "#C8C3B7",
};
const stable = {
  insightsPptx: path.join(root, "artifacts", "global-energy-atlas-insights-and-decision-use-presentation.pptx"),
  insightsPdf: path.join(root, "artifacts", "global-energy-atlas-insights-and-decision-use-presentation.pdf"),
  designPptx: path.join(root, "artifacts", "global-energy-atlas-site-design-presentation.pptx"),
  designPdf: path.join(root, "artifacts", "global-energy-atlas-site-design-presentation.pdf"),
};

const imageBytes = async (name) => new Uint8Array(await fs.readFile(path.join(shots, name)));
const heroPngPath = path.join(buildDir, "energy-hero.png");
await sharp(path.join(root, "src", "assets", "energy-hero.webp")).png().toFile(heroPngPath);
const heroBytes = new Uint8Array(await fs.readFile(heroPngPath));

function createDeck() {
  return Presentation.create({ slideSize: { width: 1280, height: 720 } });
}

function addText(slide, text, position, style = {}) {
  const box = slide.shapes.add({ geometry: "textbox", position, fill: style.fill ?? "none", line: { fill: "none", width: 0 } });
  box.text = text;
  box.text.style = {
    typeface: family, fontSize: style.fontSize ?? 24, bold: style.bold ?? false,
    color: style.color ?? C.ink, autoFit: "shrinkText", verticalAlignment: style.verticalAlignment ?? "top", ...style,
  };
  return box;
}

function addTitle(slide, title, dark = false) {
  addText(slide, title, { left: 64, top: 42, width: 1152, height: 58 }, { fontSize: 42, bold: true, color: dark ? C.white : C.ink });
}

function addFooter(slide, number, dark = false, label = "GLOBAL ENERGY DECISION ATLAS") {
  addText(slide, label, { left: 64, top: 684, width: 560, height: 20 }, { fontSize: 12, bold: true, color: dark ? "#D8E5DF" : C.muted });
  addText(slide, String(number).padStart(2, "0"), { left: 1165, top: 684, width: 50, height: 20 }, { fontSize: 12, bold: true, color: dark ? "#D8E5DF" : C.muted });
}

function addRule(slide, position, color = C.line) {
  slide.shapes.add({ geometry: "rect", position, fill: color, line: { fill: color, width: 0 } });
}

async function addScreenshot(slide, name, position, alt, fit = "contain") {
  slide.images.add({ blob: await imageBytes(name), contentType: "image/png", alt, fit, position });
}

function addNotes(slide, seconds, talkTrack, sources = []) {
  const sourceList = ["artifacts/analysis-summary.json", "data/story-presets.json", ...sources];
  slide.speakerNotes.textFrame.setText(`Time budget: ${seconds} seconds.\nTalk track: ${talkTrack}\nSources: ${sourceList.join("; ")}.`);
  slide.speakerNotes.setVisible(true);
}

function addMetric(slide, value, label, left, top, width, color = C.green, labelColor = C.muted) {
  addText(slide, value, { left, top, width, height: 54 }, { fontSize: 39, bold: true, color });
  addText(slide, label, { left, top: top + 57, width, height: 52 }, { fontSize: 18, color: labelColor });
}

function byIso(story, iso3) {
  const country = story.countries.find((item) => item.iso3 === iso3);
  if (!country) throw new Error(`Missing ${iso3} in story data`);
  return country;
}

const countryLookup = new Map(Object.values(stories).flatMap((story) => story.countries).map((country) => [country.iso3, country]));
function countryName(iso3) {
  const country = countryLookup.get(iso3);
  if (!country) throw new Error(`Missing country ${iso3}`);
  return country.country;
}

async function buildInsightsDeck() {
  const presentation = createDeck();
  const price = expanded.descriptive.householdPriceUsdPerKwh;
  const business = expanded.descriptive.businessPriceUsdPerKwh;
  const consumption = expanded.descriptive.primaryEnergyConsumptionEj;
  const mix = expanded.descriptive.nonFossilElectricityPct;
  const balance = expanded.descriptive.energyBalanceGapEj;
  const relationshipValues = Object.values(expanded.relationships);
  const relationshipR = relationshipValues.map((item) => item.r);
  const relationshipN = relationshipValues.map((item) => item.n);
  const europe = stories.europePricePeak;
  const structure = stories.ethiopiaPriceStructure;
  const concentration = stories.chinaUsConsumption;
  const balanceStory = stories.energyBalanceSplit;
  const italy = byIso(europe, "ITA");
  const germany = byIso(europe, "DEU");
  const belgium = byIso(europe, "BEL");
  const ethiopia = byIso(structure, "ETH");
  const norway = byIso(structure, "NOR");
  const algeria = byIso(structure, "DZA");
  const china = byIso(balanceStory, "CHN");
  const india = byIso(balanceStory, "IND");
  const russia = byIso(balanceStory, "RUS");
  const unitedStates = byIso(balanceStory, "USA");

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.cream;
    slide.images.add({ blob: heroBytes, contentType: "image/png", alt: "Power infrastructure at sunset", fit: "cover", position: { left: 720, top: 0, width: 560, height: 720 } });
    addText(slide, "Global Energy Decision Atlas", { left: 68, top: 70, width: 560, height: 30 }, { fontSize: 18, bold: true, color: C.green });
    addText(slide, "Which markets deserve deeper energy diligence?", { left: 68, top: 144, width: 590, height: 185 }, { fontSize: 54, bold: true });
    addText(slide, `A decision screen for corporate energy and site-selection teams across ${expanded.records} non-random markets.`, { left: 70, top: 365, width: 535, height: 104 }, { fontSize: 25, color: C.muted });
    addText(slide, "Insights and decision use | Five minutes", { left: 70, top: 614, width: 500, height: 32 }, { fontSize: 19, bold: true, color: C.green });
    addFooter(slide, 1, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 35, `The business question is which markets merit deeper energy diligence. The atlas screens ${expanded.records} markets for corporate energy and site-selection teams. It compares cost, generation structure, scale, and energy balance as separate signals. The output is an investigation order, not a final market choice.`, ["src/pages/AtlasPage.tsx"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.paper;
    addTitle(slide, "Data scope and general observations");
    addMetric(slide, String(expanded.records), "non-random markets selected for breadth and data availability", 66, 136, 252);
    addMetric(slide, `${price.n}/${price.total}`, `household price records (${price.coveragePct.toFixed(0)}% coverage)`, 346, 136, 252, C.blue);
    addMetric(slide, `${business.n}/${business.total}`, `business price records (${business.coveragePct.toFixed(0)}% coverage)`, 626, 136, 252, C.rust);
    addMetric(slide, `${consumption.n}/${consumption.total}`, `records for consumption, mix, and balance (${consumption.coveragePct.toFixed(0)}%)`, 906, 136, 290, C.green);
    addRule(slide, { left: 66, top: 277, width: 1130, height: 2 });
    addText(slide, `Reference periods differ: prices use ${expanded.periods.price}; consumption, production, and electricity mix use ${expanded.periods.consumption}.`, { left: 66, top: 315, width: 505, height: 76 }, { fontSize: 22, bold: true });
    addText(slide, `Observed ranges: household price ${price.minimum.toFixed(3)}-${price.maximum.toFixed(3)} USD/kWh; non-fossil share ${mix.minimum.toFixed(1)}-${mix.maximum.toFixed(1)}%; consumption ${consumption.minimum.toFixed(3)}-${consumption.maximum.toFixed(3)} EJ; balance gap ${balance.minimum.toFixed(1)} to +${balance.maximum.toFixed(1)} EJ.`, { left: 66, top: 420, width: 510, height: 165 }, { fontSize: 21, color: C.muted });
    addText(slide, `Complete-case correlations range from r=${Math.min(...relationshipR).toFixed(3)} to ${Math.max(...relationshipR).toFixed(3)} with n=${Math.min(...relationshipN)}-${Math.max(...relationshipN)}. They describe association only.`, { left: 66, top: 594, width: 515, height: 68 }, { fontSize: 18, color: C.muted });
    await addScreenshot(slide, "insights-scope-evidence.png", { left: 620, top: 300, width: 578, height: 348 }, "Atlas evidence table showing market rows, periods, and downloadable fields");
    addFooter(slide, 2, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 40, `The Expanded 50 is a non-random screen. Household price, consumption, non-fossil share, and balance each have ${price.n} complete records of ${price.total}; business price has ${business.n}. Prices average ${expanded.periods.price}; the energy measures use ${expanded.periods.consumption}. The ranges are wide, and the complete-case correlations use only ${Math.min(...relationshipN)} to ${Math.max(...relationshipN)} records. Association does not establish cause.`, ["data/expanded-energy-50-v1.csv", "data/expanded-energy-50-v1.sources.json"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.cream;
    addTitle(slide, "Price and generation contrasts");
    addText(slide, "European price peak", { left: 66, top: 126, width: 300, height: 34 }, { fontSize: 25, bold: true, color: C.green });
    addText(slide, `${italy.country} leads household and business prices at $${italy.householdPriceUsdPerKwh.toFixed(3)} and $${italy.businessPriceUsdPerKwh.toFixed(3)} per kWh. ${germany.country} and ${belgium.country} each report $${germany.householdPriceUsdPerKwh.toFixed(3)} household prices.`, { left: 66, top: 170, width: 455, height: 160 }, { fontSize: 22 });
    addText(slide, "Low price does not imply the same generation structure", { left: 66, top: 366, width: 455, height: 62 }, { fontSize: 25, bold: true, color: C.blue });
    addText(slide, `${ethiopia.country}: $${ethiopia.householdPriceUsdPerKwh.toFixed(3)}, ${ethiopia.nonFossilElectricityPct.toFixed(1)}% non-fossil\n${norway.country}: $${norway.householdPriceUsdPerKwh.toFixed(3)}, ${norway.nonFossilElectricityPct.toFixed(1)}% non-fossil\n${algeria.country}: $${algeria.householdPriceUsdPerKwh.toFixed(3)}, ${algeria.nonFossilElectricityPct.toFixed(1)}% non-fossil`, { left: 66, top: 438, width: 455, height: 145 }, { fontSize: 22, bold: true });
    addText(slide, "Tariff structure, contracts, and local grid conditions require separate checks.", { left: 66, top: 600, width: 470, height: 54 }, { fontSize: 19, color: C.muted });
    await addScreenshot(slide, "insights-europe-signals.png", { left: 560, top: 116, width: 650, height: 235 }, "Atlas Signals for the European price peak story");
    await addScreenshot(slide, "insights-ethiopia-signals.png", { left: 560, top: 384, width: 650, height: 235 }, "Atlas Signals for the Ethiopia price and generation structure story");
    addFooter(slide, 3, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 45, `${italy.country} is the European price high point at ${italy.householdPriceUsdPerKwh.toFixed(3)} dollars per kilowatt-hour for households and ${italy.businessPriceUsdPerKwh.toFixed(3)} for business. The structure story shows why price needs a separate mix check: ${ethiopia.country} pairs ${ethiopia.householdPriceUsdPerKwh.toFixed(3)} with ${ethiopia.nonFossilElectricityPct.toFixed(1)} percent non-fossil generation, ${norway.country} pairs ${norway.householdPriceUsdPerKwh.toFixed(3)} with ${norway.nonFossilElectricityPct.toFixed(1)} percent, and ${algeria.country} pairs ${algeria.householdPriceUsdPerKwh.toFixed(3)} with ${algeria.nonFossilElectricityPct.toFixed(1)} percent. These national averages do not reveal a facility tariff or contract.`, ["https://www.globalpetrolprices.com/electricity_prices/", "https://owid-public.owid.io/data/energy/owid-energy-data.csv"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.dark;
    addTitle(slide, "Consumption concentration", true);
    addMetric(slide, `${concentration.chinaSharePct.toFixed(1)}%`, countryName("CHN"), 70, 132, 220, "#75DCBA", "#D8E5DF");
    addMetric(slide, `${concentration.unitedStatesSharePct.toFixed(1)}%`, countryName("USA"), 312, 132, 220, "#75DCBA", "#D8E5DF");
    addMetric(slide, `${concentration.combinedSharePct.toFixed(1)}%`, `${countryName("CHN")} plus ${countryName("USA")}`, 70, 280, 462, C.white, "#D8E5DF");
    addMetric(slide, `${concentration.topFiveSharePct.toFixed(1)}%`, "top five markets", 70, 430, 462, C.white, "#D8E5DF");
    addText(slide, `Shares use ${concentration.reportedConsumptionTotalEj.toFixed(1)} EJ reported across complete records. A portfolio with equal country counts can still have a highly concentrated energy footprint.`, { left: 70, top: 575, width: 480, height: 82 }, { fontSize: 20, color: "#D8E5DF" });
    await addScreenshot(slide, "insights-consumption-signals.png", { left: 590, top: 118, width: 620, height: 236 }, "Atlas Signals for the China and United States consumption story");
    await addScreenshot(slide, "insights-consumption-charts.png", { left: 590, top: 382, width: 620, height: 244 }, "Atlas comparison charts for the consumption concentration story");
    addFooter(slide, 4, true, "INSIGHTS AND DECISION USE");
    addNotes(slide, 45, `${countryName("CHN")} accounts for ${concentration.chinaSharePct.toFixed(1)} percent of reported consumption and the ${countryName("USA")} for ${concentration.unitedStatesSharePct.toFixed(1)} percent. Together they represent ${concentration.combinedSharePct.toFixed(1)} percent; the top five represent ${concentration.topFiveSharePct.toFixed(1)} percent of ${concentration.reportedConsumptionTotalEj.toFixed(1)} reported exajoules. Country counts therefore do not measure portfolio weight. A few large markets can dominate exposure and the value of follow-up work.`, ["data/expanded-energy-50-v1.csv", "https://owid-public.owid.io/data/energy/owid-energy-data.csv"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.paper;
    addTitle(slide, "Energy balance positions");
    addText(slide, balanceStory.definition, { left: 66, top: 118, width: 515, height: 50 }, { fontSize: 22, bold: true, color: C.green });
    addMetric(slide, `+${china.energyBalanceGapEj.toFixed(1)} EJ`, china.country, 70, 195, 225, C.rust);
    addMetric(slide, `+${india.energyBalanceGapEj.toFixed(1)} EJ`, india.country, 315, 195, 225, C.rust);
    addMetric(slide, `${russia.energyBalanceGapEj.toFixed(1)} EJ`, russia.country, 70, 350, 225, C.blue);
    addMetric(slide, `${unitedStates.energyBalanceGapEj.toFixed(1)} EJ`, unitedStates.country, 315, 350, 225, C.blue);
    addText(slide, "Positive values indicate a consumption gap. Negative values indicate production above consumption. The measure does not observe actual trade flows.", { left: 70, top: 535, width: 480, height: 100 }, { fontSize: 21, color: C.muted });
    await addScreenshot(slide, "insights-balance-signals.png", { left: 590, top: 118, width: 620, height: 236 }, "Atlas Signals for the energy balance split story");
    await addScreenshot(slide, "insights-balance-charts.png", { left: 590, top: 382, width: 620, height: 244 }, "Atlas comparison charts for the energy balance story");
    addFooter(slide, 5, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 45, `The balance gap is consumption minus production. ${china.country} is positive ${china.energyBalanceGapEj.toFixed(1)} exajoules and ${india.country} is positive ${india.energyBalanceGapEj.toFixed(1)}. ${russia.country} is ${russia.energyBalanceGapEj.toFixed(1)} and the ${unitedStates.country} is ${unitedStates.energyBalanceGapEj.toFixed(1)}. These positions help order exposure questions. They are not actual import or export flows because the calculation does not observe inventories, transformation losses, or cross-border movements.`, ["data/expanded-energy-50-v1.csv", "https://api.eia.gov/bulk/INTL.zip"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.cream;
    addTitle(slide, "Decision use and diligence shortlist");
    addText(slide, `${countryName("CHN")}, ${countryName("IND")}, and ${countryName("USA")}`, { left: 66, top: 132, width: 520, height: 44 }, { fontSize: 25, bold: true, color: C.green });
    addText(slide, "Start with scale and balance exposure.", { left: 66, top: 179, width: 520, height: 44 }, { fontSize: 21 });
    addText(slide, `${countryName("ETH")}, ${countryName("NOR")}, ${countryName("ITA")}, and ${countryName("DZA")}`, { left: 66, top: 253, width: 520, height: 76 }, { fontSize: 25, bold: true, color: C.blue });
    addText(slide, "Test the price and generation contrasts against local operating conditions.", { left: 66, top: 335, width: 520, height: 66 }, { fontSize: 21 });
    addRule(slide, { left: 66, top: 432, width: 520, height: 2 });
    addText(slide, "Local checks before a decision", { left: 66, top: 462, width: 420, height: 36 }, { fontSize: 25, bold: true });
    addText(slide, "Facility tariff and demand charges\nContract term, indexation, and hedging\nAvailable grid capacity and connection cost\nReliability, curtailment, and outage history", { left: 66, top: 510, width: 520, height: 140 }, { fontSize: 21, color: C.muted });
    await addScreenshot(slide, "insights-story-views.png", { left: 626, top: 122, width: 586, height: 430 }, "Four reproducible Atlas story views used to order diligence");
    addText(slide, "This sequence orders investigation. It does not rank the best market.", { left: 655, top: 575, width: 525, height: 66 }, { fontSize: 22, bold: true, color: C.rust });
    addFooter(slide, 6, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 50, `The shortlist orders investigation rather than ranking the best market. Start with ${countryName("CHN")}, ${countryName("IND")}, and the ${countryName("USA")} for scale and balance exposure. Use ${countryName("ETH")}, ${countryName("NOR")}, ${countryName("ITA")}, and ${countryName("DZA")} to test the sharp price and mix contrasts. For every case, replace the national screen with the facility tariff and demand charges, contract terms and hedging, available grid capacity and connection cost, plus reliability and curtailment history.`, ["https://www.iea.org/reports/italy-2023/executive-summary", "https://www.worldbank.org/content/dam/theworldbankgroupasset/document/2026/Ethiopia-National-Energy-Compact-Mission-300.pdf"]);
  }

  {
    const slide = presentation.slides.add();
    slide.background.fill = C.paper;
    addTitle(slide, "Method, evidence boundaries, and limitations");
    addText(slide, "Analysis status", { left: 66, top: 126, width: 300, height: 34 }, { fontSize: 25, bold: true, color: C.green });
    addText(slide, `Descriptive / ${evidenceBoundaries.descriptive.status}\nDiagnostic / ${evidenceBoundaries.diagnostic.status}\nPredictive / not performed\nPrescriptive / not performed`, { left: 66, top: 172, width: 420, height: 145 }, { fontSize: 23, bold: true });
    addText(slide, "Limits that affect interpretation", { left: 66, top: 346, width: 430, height: 34 }, { fontSize: 25, bold: true, color: C.green });
    addText(slide, "Missing values change denominators. Reference years differ. National averages do not represent a facility contract or connection point. Complete-case correlations do not establish causation.", { left: 66, top: 394, width: 440, height: 140 }, { fontSize: 21 });
    addText(slide, `${deliverableCount} stable files | global-energy-decision-atlas.vercel.app/deliverables`, { left: 66, top: 586, width: 500, height: 56 }, { fontSize: 18, bold: true, color: C.muted });
    await addScreenshot(slide, "08-deliverables.png", { left: 560, top: 116, width: 650, height: 505 }, `Public deliverables page with five course requirements and ${deliverableCount} files`);
    addFooter(slide, 7, false, "INSIGHTS AND DECISION USE");
    addNotes(slide, 40, `Descriptive analysis is ${evidenceBoundaries.descriptive.status}; diagnostic analysis is ${evidenceBoundaries.diagnostic.status}. Predictive and prescriptive work were not performed. The atlas does not predict future electricity prices, demand, reliability, or emissions, and it does not identify an optimal site. Missing values change denominators, the indicators mix reference years, and national averages do not substitute for facility tariffs or reliability records. The correlations do not establish causation, and the balance gap is not an observed trade flow. The public Deliverables page provides all ${deliverableCount} files without sign-in.`, ["README.md", "data/deliverables.json", "src/pages/DeliverablesPage.tsx"]);
  }

  return presentation;
}

async function buildSiteDesignDeck() {
  const presentation = createDeck();
  {
    const slide = presentation.slides.add();
    slide.background.fill = C.cream;
    slide.images.add({ blob: heroBytes, contentType: "image/png", alt: "Power infrastructure at sunset", fit: "cover", position: { left: 710, top: 0, width: 570, height: 720 } });
    addText(slide, "Global Energy Decision Atlas", { left: 68, top: 72, width: 560, height: 30 }, { fontSize: 18, bold: true, color: C.green });
    addText(slide, "Site design and interaction walkthrough", { left: 68, top: 142, width: 570, height: 150 }, { fontSize: 56, bold: true });
    addText(slide, "Login, filters, map behavior, responsive controls, multilingual support, and evidence traceability.", { left: 72, top: 342, width: 520, height: 118 }, { fontSize: 25, color: C.muted });
    addText(slide, "Supplemental design walkthrough", { left: 72, top: 618, width: 410, height: 28 }, { fontSize: 18, bold: true, color: C.green });
    addFooter(slide, 1, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 35, `Introduce this deck as a supplemental walkthrough of the atlas design. It explains how the interface gives corporate energy and site-selection teams access to the ${expanded.records}-market screen, how controls shape the evidence, and how the product preserves traceability. The formal five-minute course presentation is the separate Insights and Decision Use deck.`, ["src/pages/LandingPage.tsx", "src/pages/AtlasPage.tsx"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.cream; addTitle(slide, "Access, personalization, and saved views");
    addText(slide, "Account", { left: 66, top: 142, width: 360, height: 34 }, { fontSize: 27, bold: true, color: C.green });
    addText(slide, "Signed-in users keep saved views, language, and theme settings across devices.", { left: 66, top: 188, width: 385, height: 92 }, { fontSize: 24 });
    addText(slide, "Guest", { left: 66, top: 326, width: 360, height: 34 }, { fontSize: 27, bold: true, color: C.green });
    addText(slide, "Guest access opens the evidence without storing customized views or activity history.", { left: 66, top: 372, width: 385, height: 98 }, { fontSize: 24 });
    addText(slide, "Six languages include Arabic RTL. Light, dark, and system themes remain available before and after sign-in.", { left: 66, top: 525, width: 410, height: 92 }, { fontSize: 23, color: C.muted });
    await addScreenshot(slide, "01-login.png", { left: 500, top: 118, width: 714, height: 500 }, "Atlas sign-in and Guest entry screen");
    addText(slide, "The entry page explains what persists before the user chooses an access path.", { left: 530, top: 628, width: 650, height: 38 }, { fontSize: 20, color: C.muted });
    addFooter(slide, 2, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 40, "Show the sign-in and Guest choices. Guest users can review the full atlas. Accounts add cross-device saved views and profile preferences. Point out the language and appearance controls, including Arabic right-to-left layout.", ["src/pages/AuthPage.tsx", "src/components/PreferenceControls.tsx"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.dark; addTitle(slide, "Analysis controls", true);
    addText(slide, "Dataset", { left: 68, top: 144, width: 255, height: 32 }, { fontSize: 27, bold: true, color: "#75DCBA" });
    addText(slide, "Switch between the supplied 15-country file and the Expanded 50 snapshot.", { left: 68, top: 187, width: 390, height: 82 }, { fontSize: 23, color: C.white });
    addText(slide, "Scope and display", { left: 68, top: 298, width: 300, height: 32 }, { fontSize: 27, bold: true, color: "#75DCBA" });
    addText(slide, "Choose countries or regions, then compare members or generation-weighted aggregates.", { left: 68, top: 341, width: 390, height: 92 }, { fontSize: 23, color: C.white });
    addText(slide, "Metric and focus", { left: 68, top: 474, width: 300, height: 32 }, { fontSize: 27, bold: true, color: "#75DCBA" });
    addText(slide, "Set the price audience and map metric. Focus countries control the comparison charts while the wider scope stays visible.", { left: 68, top: 517, width: 400, height: 108 }, { fontSize: 23, color: C.white });
    await addScreenshot(slide, "03-filters-controls.png", { left: 520, top: 114, width: 300, height: 525 }, "Open analysis filter rail showing dataset, scope, display, and metric controls");
    await addScreenshot(slide, "03-filters-selection.png", { left: 850, top: 114, width: 300, height: 525 }, "Open analysis filter rail showing region and focus-country selection");
    addFooter(slide, 3, true, "SITE DESIGN PRESENTATION");
    addNotes(slide, 45, "Open the filter rail. Demonstrate Dataset, countries or regions, Members or Aggregate, Price audience, Map metric, and Focus countries. The rail supports hover, keyboard focus, click, pinning, Escape, and a touch drawer on mobile.", ["src/components/FilterRail.tsx", "src/filter-rail-events.ts"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.cream; addTitle(slide, "Map evidence");
    await addScreenshot(slide, "04-map.png", { left: 58, top: 112, width: 1164, height: 486 }, "World map with metric legend, selection outlines, and country inspector");
    for (const [text, left, width] of [["Metric and units", 78, 250], ["Zoom and reset", 382, 220], ["Country selection", 670, 230], ["Scope and focus marks", 960, 255]]) addText(slide, text, { left, top: 616, width, height: 30 }, { fontSize: 20, bold: true, color: C.green });
    addFooter(slide, 4, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 40, "Use the map to show that the selected measure controls both color and legend units. Hover or select a country to inspect value, period, and source. Zoom and reset stay inside the component. Separate outlines show analysis scope and focus countries.", ["src/components/WorldMap.tsx"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.paper; addTitle(slide, "Cost, mix, balance, and records");
    await addScreenshot(slide, "06-charts.png", { left: 62, top: 118, width: 560, height: 410 }, "Cost and generation charts");
    await addScreenshot(slide, "07-evidence.png", { left: 658, top: 118, width: 560, height: 410 }, "Evidence table and CSV download");
    addText(slide, "Cost x Mix and Electricity mix", { left: 72, top: 548, width: 530, height: 30 }, { fontSize: 20, bold: true, color: C.green });
    addText(slide, "Median lines frame the price and non-fossil screen. The normalized stacked bars preserve composition and end at 100 percent.", { left: 72, top: 586, width: 530, height: 70 }, { fontSize: 20, color: C.muted });
    addText(slide, "Balance, Evidence table, and CSV", { left: 670, top: 548, width: 520, height: 30 }, { fontSize: 20, bold: true, color: C.green });
    addText(slide, "Periods, fallback flags, and stable machine fields carry the visual comparison into the downloadable record.", { left: 670, top: 586, width: 520, height: 70 }, { fontSize: 20, color: C.muted });
    addFooter(slide, 5, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 45, "Move from Cost x Mix to the normalized Electricity mix and the balance view. Then show the Evidence table. The table carries periods and fallback status, supports sorting, and exports stable CSV fields for the active selection.", ["src/pages/AtlasPage.tsx", "src/analytics.ts"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.cream; addTitle(slide, "Fixed story views and dynamic Signals");
    await addScreenshot(slide, "04-stories.png", { left: 58, top: 118, width: 560, height: 408 }, "Four fixed story cards with Atlas evidence, market context, sources, and view actions");
    await addScreenshot(slide, "05-signals.png", { left: 662, top: 118, width: 560, height: 408 }, "Dynamic Signals with complete coverage sentences for the active story view");
    addText(slide, "Fixed views", { left: 70, top: 548, width: 240, height: 30 }, { fontSize: 21, bold: true, color: C.green });
    addText(slide, "One action applies the full scope, focus, metric, and sort configuration while keeping language and theme.", { left: 70, top: 584, width: 540, height: 74 }, { fontSize: 20, color: C.muted });
    addText(slide, "Complete sample language", { left: 674, top: 548, width: 300, height: 30 }, { fontSize: 21, bold: true, color: C.green });
    addText(slide, "Signals name the complete records, denominator, entity type, and measure instead of showing an isolated n and percent.", { left: 674, top: 584, width: 540, height: 74 }, { fontSize: 20, color: C.muted });
    addFooter(slide, 6, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 50, "Open one of the four fixed story views. The action applies its dataset, countries, focus list, price audience, map metric, and sort order without creating a saved view. Then show the Signals sample sentence. It names complete records, the denominator, and whether the evidence represents markets or regional aggregates.", ["src/insights.ts"]);
  }
  {
    const slide = presentation.slides.add(); slide.background.fill = C.paper; addTitle(slide, "Evidence boundaries and deliverables");
    addText(slide, "Analysis status", { left: 68, top: 138, width: 360, height: 34 }, { fontSize: 27, bold: true, color: C.green });
    addText(slide, `Descriptive / ${evidenceBoundaries.descriptive.status}\nDiagnostic / ${evidenceBoundaries.diagnostic.status}\nPredictive / not performed\nPrescriptive / not performed`, { left: 68, top: 186, width: 400, height: 142 }, { fontSize: 23, bold: true });
    addText(slide, "Decision boundary", { left: 68, top: 362, width: 360, height: 34 }, { fontSize: 27, bold: true, color: C.green });
    addText(slide, "The shortlist orders diligence. It does not prove a best market, forecast future conditions, calculate investment return, or select an optimal site. The balance gap is not an observed trade flow.", { left: 68, top: 408, width: 400, height: 118 }, { fontSize: 22 });
    addText(slide, `${deliverableCount} stable files\nglobal-energy-decision-atlas.vercel.app\n/deliverables`, { left: 68, top: 542, width: 430, height: 88 }, { fontSize: 17, bold: true, color: C.muted });
    await addScreenshot(slide, "08-deliverables.png", { left: 510, top: 116, width: 708, height: 500 }, `Public deliverables page with five course requirements and ${deliverableCount} source files`);
    addText(slide, `The public page opens without sign-in and preserves all ${deliverableCount} download names.`, { left: 535, top: 626, width: 650, height: 36 }, { fontSize: 20, color: C.muted });
    addFooter(slide, 7, false, "SITE DESIGN PRESENTATION");
    addNotes(slide, 45, `Close with the boundary between completed and unperformed work. Descriptive analysis is ${evidenceBoundaries.descriptive.status}; diagnostic analysis is ${evidenceBoundaries.diagnostic.status}. Predictive and prescriptive analysis were not performed. The atlas cannot predict future electricity prices, demand, reliability, or emissions. It does not prove a best market, investment return, or optimal site. The balance gap is not an observed trade flow. The public Deliverables page provides all ${deliverableCount} stable files without sign-in.`, ["data/deliverables.json", "src/pages/DeliverablesPage.tsx"]);
  }
  return presentation;
}

async function finalizeDeck(presentation, slug, stablePath) {
  const candidatePath = path.join(stagingDir, `${slug}-${buildId}-candidate.pptx`);
  const finalPath = path.join(outputDir, `${slug}-${buildId}.pptx`);
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
  await finalizePresentation({
    explicitTotalSlideCount: 7, requiredNativeTableOwnerSlides: [], requiredNativeChartOwnerSlides: [],
    workspaceDir: root, candidatePath, finalPath, pythonExecutable: runtimePython,
    integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
    fontPolicy: { basis: "design", families: [family] }, verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, `${slug}-${buildId}.validation.json`),
  });
  await fs.copyFile(finalPath, stablePath);
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

const insightsDeck = await buildInsightsDeck();
const designDeck = await buildSiteDesignDeck();
await finalizeDeck(insightsDeck, "global-energy-atlas-insights-and-decision-use-presentation", stable.insightsPptx);
await finalizeDeck(designDeck, "global-energy-atlas-site-design-presentation", stable.designPptx);
for (const pptx of [stable.insightsPptx, stable.designPptx]) await run(soffice, ["--headless", "--convert-to", "pdf", "--outdir", pdfDir, pptx]);
await fs.copyFile(path.join(pdfDir, path.basename(stable.insightsPdf)), stable.insightsPdf);
await fs.copyFile(path.join(pdfDir, path.basename(stable.designPdf)), stable.designPdf);
console.log(JSON.stringify(stable, null, 2));
