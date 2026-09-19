import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const root = process.env.ATLAS_WORKSPACE_ROOT
  ? path.resolve(process.env.ATLAS_WORKSPACE_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillDir =
  "/Users/zhekaili/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const shots = path.join(root, "tmp", "site-screenshots");
const buildDir = path.join(root, "tmp", "presentation-build");
const outputDir = path.join(root, "tmp", "presentation-output");
const stagingDir = path.join(root, ".codex-finalizer");
const buildId = Date.now();
const stablePath = path.join(
  root,
  "artifacts",
  "global-energy-atlas-site-demo.pptx",
);
const finalPath = path.join(
  outputDir,
  `global-energy-atlas-site-demo-${buildId}.pptx`,
);
const runtimePython =
  "/Users/zhekaili/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3.12";

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(stablePath), { recursive: true });

const analysisSummary = JSON.parse(
  await fs.readFile(path.join(root, "artifacts", "analysis-summary.json"), "utf8"),
);
const deliverableManifest = JSON.parse(
  await fs.readFile(path.join(root, "data", "deliverables.json"), "utf8"),
);
const evidenceBoundaries = analysisSummary.evidenceBoundaries;
const deliverableCount = deliverableManifest.groups.flatMap(
  (group) => group.files,
).length;

const { finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs"))
    .href
);
const family = "Arial";
const presentation = Presentation.create({
  slideSize: { width: 1280, height: 720 },
});

const C = {
  cream: "#F1EEE6",
  paper: "#FBF9F3",
  ink: "#17201C",
  green: "#087F5B",
  paleGreen: "#D8EFE7",
  blue: "#27779B",
  muted: "#59645D",
  white: "#FFFFFF",
  dark: "#07131A",
  line: "#C8C3B7",
};

const imageBytes = async (name) =>
  new Uint8Array(await fs.readFile(path.join(shots, name)));
const heroPngPath = path.join(buildDir, "energy-hero.png");
await sharp(path.join(root, "src", "assets", "energy-hero.webp"))
  .png()
  .toFile(heroPngPath);
const heroBytes = new Uint8Array(await fs.readFile(heroPngPath));

function addText(slide, text, position, style = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: style.fill ?? "none",
    line: { fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: family,
    fontSize: style.fontSize ?? 24,
    bold: style.bold ?? false,
    color: style.color ?? C.ink,
    autoFit: "shrinkText",
    ...style,
  };
  return box;
}

function addTitle(slide, title) {
  addText(
    slide,
    title,
    { left: 64, top: 42, width: 1152, height: 58 },
    { fontSize: 44, bold: true },
  );
}

function addFooter(slide, number, dark = false) {
  addText(
    slide,
    "GLOBAL ENERGY DECISION ATLAS",
    { left: 64, top: 684, width: 430, height: 20 },
    { fontSize: 12, bold: true, color: dark ? "#D8E5DF" : C.muted },
  );
  addText(
    slide,
    String(number).padStart(2, "0"),
    { left: 1165, top: 684, width: 50, height: 20 },
    { fontSize: 12, bold: true, color: dark ? "#D8E5DF" : C.muted },
  );
}

async function addScreenshot(slide, name, position, alt) {
  slide.images.add({
    blob: await imageBytes(name),
    contentType: "image/png",
    alt,
    fit: "contain",
    position,
  });
}

function addNotes(slide, seconds, talkTrack, extraSources = []) {
  const sources = [
    "local Global Energy Decision Atlas interface",
    "data/energy-data.csv",
    "data/expanded-energy-50-v1.csv",
    "artifacts/analysis-summary.json",
    ...extraSources,
  ];
  slide.speakerNotes.textFrame.setText(
    `Time budget: ${seconds} seconds.\nTalk track: ${talkTrack}\nSources: ${sources.join("; ")}.`,
  );
  slide.speakerNotes.setVisible(true);
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.cream;
  slide.images.add({
    blob: heroBytes,
    contentType: "image/png",
    alt: "Power infrastructure at sunset",
    fit: "cover",
    position: { left: 710, top: 0, width: 570, height: 720 },
  });
  addText(
    slide,
    "Global Energy Decision Atlas",
    { left: 68, top: 72, width: 560, height: 30 },
    { fontSize: 18, bold: true, color: C.green },
  );
  addText(
    slide,
    `A diligence shortlist from ${analysisSummary.expanded50.records} markets`,
    { left: 68, top: 142, width: 560, height: 150 },
    { fontSize: 58, bold: true, color: C.ink },
  );
  addText(
    slide,
    "A five-minute demonstration of the evidence, interpretation, and next data request behind a market screen.",
    { left: 72, top: 342, width: 520, height: 118 },
    { fontSize: 25, color: C.muted },
  );
  addText(
    slide,
    "Five-minute site demonstration",
    { left: 72, top: 618, width: 360, height: 28 },
    { fontSize: 18, bold: true, color: C.green },
  );
  addFooter(slide, 1);
  addNotes(
    slide,
    35,
    `Open with the management question: which markets deserve deeper diligence? The atlas screens ${analysisSummary.expanded50.records} markets and returns a traceable shortlist. It keeps cost, generation structure, scale, and energy balance as separate measures.`,
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.cream;
  addTitle(slide, "Access, personalization, and saved views");
  addText(
    slide,
    "Account",
    { left: 66, top: 142, width: 360, height: 34 },
    { fontSize: 27, bold: true, color: C.green },
  );
  addText(
    slide,
    "Signed-in users keep saved views, language, and theme settings across devices.",
    { left: 66, top: 188, width: 385, height: 92 },
    { fontSize: 24 },
  );
  addText(
    slide,
    "Guest",
    { left: 66, top: 326, width: 360, height: 34 },
    { fontSize: 27, bold: true, color: C.green },
  );
  addText(
    slide,
    "Guest access opens the evidence without storing customized views or activity history.",
    { left: 66, top: 372, width: 385, height: 98 },
    { fontSize: 24 },
  );
  addText(
    slide,
    "Six languages include Arabic RTL. Light, dark, and system themes remain available before and after sign-in.",
    { left: 66, top: 525, width: 410, height: 92 },
    { fontSize: 23, color: C.muted },
  );
  await addScreenshot(
    slide,
    "01-login.png",
    { left: 500, top: 118, width: 714, height: 500 },
    "Atlas sign-in and Guest entry screen",
  );
  addText(
    slide,
    "The entry page explains what persists before the user chooses an access path.",
    { left: 530, top: 628, width: 650, height: 38 },
    { fontSize: 20, color: C.muted },
  );
  addFooter(slide, 2);
  addNotes(
    slide,
    40,
    "Show the sign-in and Guest choices. Guest users can review the full atlas. Accounts add cross-device saved views and profile preferences. Point out the language and appearance controls, including Arabic right-to-left layout.",
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.dark;
  addText(
    slide,
    "Analysis controls",
    { left: 64, top: 42, width: 1140, height: 58 },
    { fontSize: 44, bold: true, color: C.white },
  );
  addText(
    slide,
    "Dataset",
    { left: 68, top: 144, width: 255, height: 32 },
    { fontSize: 27, bold: true, color: "#75DCBA" },
  );
  addText(
    slide,
    "Switch between the supplied 15-country file and the Expanded 50 snapshot.",
    { left: 68, top: 187, width: 390, height: 82 },
    { fontSize: 23, color: C.white },
  );
  addText(
    slide,
    "Scope and display",
    { left: 68, top: 298, width: 300, height: 32 },
    { fontSize: 27, bold: true, color: "#75DCBA" },
  );
  addText(
    slide,
    "Choose countries or regions, then compare members or generation-weighted aggregates.",
    { left: 68, top: 341, width: 390, height: 92 },
    { fontSize: 23, color: C.white },
  );
  addText(
    slide,
    "Metric and focus",
    { left: 68, top: 474, width: 300, height: 32 },
    { fontSize: 27, bold: true, color: "#75DCBA" },
  );
  addText(
    slide,
    "Set the price audience and map metric. Focus countries control the comparison charts while the wider scope stays visible.",
    { left: 68, top: 517, width: 400, height: 108 },
    { fontSize: 23, color: C.white },
  );
  await addScreenshot(
    slide,
    "03-filters-controls.png",
    { left: 520, top: 114, width: 300, height: 525 },
    "Open analysis filter rail showing dataset, scope, display, and metric controls",
  );
  await addScreenshot(
    slide,
    "03-filters-selection.png",
    { left: 850, top: 114, width: 300, height: 525 },
    "Open analysis filter rail showing region and focus-country selection",
  );
  addFooter(slide, 3, true);
  addNotes(
    slide,
    45,
    "Open the filter rail. Demonstrate Dataset, countries or regions, Members or Aggregate, Price audience, Map metric, and Focus countries. The rail supports hover, keyboard focus, click, pinning, Escape, and a touch drawer on mobile.",
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.cream;
  addTitle(slide, "Map evidence");
  await addScreenshot(
    slide,
    "04-map.png",
    { left: 58, top: 112, width: 1164, height: 486 },
    "World map with metric legend, selection outlines, and country inspector",
  );
  addText(
    slide,
    "Metric and units",
    { left: 78, top: 616, width: 250, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addText(
    slide,
    "Zoom and reset",
    { left: 382, top: 616, width: 220, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addText(
    slide,
    "Country selection",
    { left: 670, top: 616, width: 230, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addText(
    slide,
    "Scope and focus marks",
    { left: 960, top: 616, width: 255, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addFooter(slide, 4);
  addNotes(
    slide,
    40,
    "Use the map to show that the selected measure controls both color and legend units. Hover or select a country to inspect value, period, and source. Zoom and reset stay inside the component. Separate outlines show analysis scope and focus countries.",
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addTitle(slide, "Cost, mix, balance, and records");
  await addScreenshot(
    slide,
    "06-charts.png",
    { left: 62, top: 118, width: 560, height: 410 },
    "Cost and generation charts",
  );
  await addScreenshot(
    slide,
    "07-evidence.png",
    { left: 658, top: 118, width: 560, height: 410 },
    "Evidence table and CSV download",
  );
  addText(
    slide,
    "Cost x Mix and Electricity mix",
    { left: 72, top: 548, width: 530, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addText(
    slide,
    "Median lines frame the price and non-fossil screen. The normalized stacked bars preserve composition and end at 100 percent.",
    { left: 72, top: 586, width: 530, height: 70 },
    { fontSize: 20, color: C.muted },
  );
  addText(
    slide,
    "Balance, Evidence table, and CSV",
    { left: 670, top: 548, width: 520, height: 30 },
    { fontSize: 20, bold: true, color: C.green },
  );
  addText(
    slide,
    "Periods, fallback flags, and stable machine fields carry the visual comparison into the downloadable record.",
    { left: 670, top: 586, width: 520, height: 70 },
    { fontSize: 20, color: C.muted },
  );
  addFooter(slide, 5);
  addNotes(
    slide,
    45,
    "Move from Cost x Mix to the normalized Electricity mix and the balance view. Then show the Evidence table. The table carries periods and fallback status, supports sorting, and exports stable CSV fields for the active selection.",
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.cream;
  addTitle(slide, "Fixed story views and dynamic Signals");
  await addScreenshot(
    slide,
    "04-stories.png",
    { left: 58, top: 118, width: 560, height: 408 },
    "Four fixed story cards with Atlas evidence, market context, sources, and view actions",
  );
  await addScreenshot(
    slide,
    "05-signals.png",
    { left: 662, top: 118, width: 560, height: 408 },
    "Dynamic Signals with complete coverage sentences for the active story view",
  );
  addText(
    slide,
    "Fixed views",
    { left: 70, top: 548, width: 240, height: 30 },
    { fontSize: 21, bold: true, color: C.green },
  );
  addText(
    slide,
    "One action applies the full scope, focus, metric, and sort configuration while keeping language and theme.",
    { left: 70, top: 584, width: 540, height: 74 },
    { fontSize: 20, color: C.muted },
  );
  addText(
    slide,
    "Complete sample language",
    { left: 674, top: 548, width: 300, height: 30 },
    { fontSize: 21, bold: true, color: C.green },
  );
  addText(
    slide,
    "Signals name the complete records, denominator, entity type, and measure instead of showing an isolated n and percent.",
    { left: 674, top: 584, width: 540, height: 74 },
    { fontSize: 20, color: C.muted },
  );
  addFooter(slide, 6);
  addNotes(
    slide,
    50,
    "Open one of the four fixed story views. The action applies its dataset, countries, focus list, price audience, map metric, and sort order without creating a saved view. Then show the Signals sample sentence. It names complete records, the denominator, and whether the evidence represents markets or regional aggregates.",
    [
      "https://www.iea.org/reports/italy-2023/executive-summary",
      "https://ec.europa.eu/eurostat/en/web/energy/information-data",
      "https://www.worldbank.org/content/dam/theworldbankgroupasset/document/2026/Ethiopia-National-Energy-Compact-Mission-300.pdf",
      "https://www.iea.org/reports/electricity-2025/executive-summary",
      "https://www.eia.gov/todayinenergy/detail.php?id=62407",
      "https://www.eia.gov/international/content/analysis/countries_long/russia/",
    ],
  );
}

{
  const slide = presentation.slides.add();
  slide.background.fill = C.paper;
  addTitle(slide, "Evidence boundaries and deliverables");
  addText(
    slide,
    "Analysis status",
    { left: 68, top: 138, width: 360, height: 34 },
    { fontSize: 27, bold: true, color: C.green },
  );
  addText(
    slide,
    `Descriptive / ${evidenceBoundaries.descriptive.status}\nDiagnostic / ${evidenceBoundaries.diagnostic.status}\nPredictive / not performed\nPrescriptive / not performed`,
    { left: 68, top: 186, width: 400, height: 142 },
    { fontSize: 23, bold: true },
  );
  addText(
    slide,
    "Decision boundary",
    { left: 68, top: 362, width: 360, height: 34 },
    { fontSize: 27, bold: true, color: C.green },
  );
  addText(
    slide,
    "The shortlist orders diligence. It does not prove a best market, forecast future conditions, calculate investment return, or select an optimal site. The balance gap is not an observed trade flow.",
    { left: 68, top: 408, width: 400, height: 118 },
    { fontSize: 22 },
  );
  addText(
    slide,
    `${deliverableCount} stable files\nglobal-energy-decision-atlas.vercel.app\n/deliverables`,
    { left: 68, top: 542, width: 430, height: 88 },
    { fontSize: 17, bold: true, color: C.muted },
  );
  await addScreenshot(
    slide,
    "08-deliverables.png",
    { left: 510, top: 116, width: 708, height: 500 },
    "Public deliverables page with five course requirements and nine source files",
  );
  addText(
    slide,
    "The public page opens without sign-in and preserves all nine download names.",
    { left: 535, top: 626, width: 650, height: 36 },
    { fontSize: 20, color: C.muted },
  );
  addFooter(slide, 7);
  addNotes(
    slide,
    45,
    `Close with the boundary between completed and unperformed work. Descriptive analysis is ${evidenceBoundaries.descriptive.status}; diagnostic analysis is ${evidenceBoundaries.diagnostic.status}. Predictive and prescriptive analysis were not performed. The atlas cannot predict future electricity prices, demand, reliability, or emissions. It does not prove a best market, investment return, or optimal site. The balance gap is not an observed trade flow. The public Deliverables page provides all ${deliverableCount} stable files without sign-in.`,
  );
}

const candidatePath = path.join(
  stagingDir,
  "global-energy-atlas-site-demo-candidate.pptx",
);
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

await finalizePresentation({
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: root,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(
    skillDir,
    "container_tools/inspect_presentation_package_integrity.py",
  ),
  layoutValidatorPath: path.join(
    skillDir,
    "container_tools/inspect_presentation_layout_geometry.py",
  ),
  layoutArgs: [
    "--expected-slide-size-emu",
    "12192000,6858000",
    "--validate-heading-fit",
  ],
  fontPolicy: { basis: "design", families: [family] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(
    stagingDir,
    `global-energy-atlas-site-demo-${buildId}.validation.json`,
  ),
});

await fs.copyFile(finalPath, stablePath);
console.log(stablePath);
