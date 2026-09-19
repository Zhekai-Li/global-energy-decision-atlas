import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = process.env.ATLAS_PRODUCTION_URL ?? "https://global-energy-decision-atlas.vercel.app";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "data", "deliverables.json"), "utf8"),
);

try {
  await page.goto(`${baseUrl}/atlas#methodology`, { waitUntil: "networkidle" });
  if (!page.url().includes("/login?next=")) throw new Error(`Deep link did not redirect: ${page.url()}`);
  await page.getByRole("button", { name: "Continue without signing in" }).waitFor();
  await page.getByRole("button", { name: "Continue without signing in" }).click();
  await page.getByRole("table").waitFor();

  const stories = [
    ["europe-price-peak", "price"],
    ["ethiopia-price-structure", "nonFossil"],
    ["china-us-consumption", "consumption"],
    ["energy-balance-split", "tradeExposure"],
  ];
  for (const [id, metric] of stories) {
    const card = page.getByTestId(`story-${id}`);
    await card.getByRole("button", { name: /Open this view|View active/ }).click();
    if (!(await card.getAttribute("class"))?.includes("is-active")) throw new Error(`${id} was not active`);
    if ((await page.getByLabel("Map metric", { exact: true }).inputValue()) !== metric) {
      throw new Error(`${id} did not apply map metric ${metric}`);
    }
    if ((await page.getByRole("combobox", { name: "Sort by", exact: true }).inputValue()) !== metric) {
      throw new Error(`${id} did not apply sort metric ${metric}`);
    }
  }

  await page.goto(`${baseUrl}/deliverables`, { waitUntil: "networkidle" });
  if (!page.url().endsWith("/deliverables")) throw new Error(`Public deliverables route failed: ${page.url()}`);
  const expected = manifest.groups.flatMap((group) =>
    group.files.map((file) => [file.downloadName, file.signature]),
  );
  const links = page.locator("[data-deliverable-download]");
  if ((await links.count()) !== expected.length) throw new Error("Unexpected deliverable count");
  for (let index = 0; index < expected.length; index += 1) {
    const [name, signature] = expected[index];
    const href = await links.nth(index).getAttribute("href");
    const response = await context.request.get(new URL(href, page.url()).toString());
    if (response.status() !== 200) throw new Error(`${name} returned ${response.status()}`);
    const downloadPromise = page.waitForEvent("download");
    await links.nth(index).click();
    const download = await downloadPromise;
    if (download.suggestedFilename() !== name) throw new Error(`Unexpected filename: ${download.suggestedFilename()}`);
    const bytes = await readFile(await download.path());
    if (signature === "pdf" && bytes.subarray(0, 4).toString() !== "%PDF") throw new Error(`${name} is not a PDF`);
    if (signature === "zip" && bytes.subarray(0, 2).toString() !== "PK") throw new Error(`${name} is not a ZIP container`);
    if (signature === "json" && !bytes.toString("utf8").trimStart().startsWith("{")) throw new Error(`${name} is not JSON`);
    if (signature === "markdown" && !bytes.toString("utf8").startsWith("# ")) throw new Error(`${name} is not Markdown`);
    if (signature === "text" && !bytes.toString("utf8", 0, 80).includes(",")) throw new Error(`${name} is not CSV`);
  }

  await page.goto(`${baseUrl}/atlas#deliverables`, { waitUntil: "networkidle" });
  if (!page.url().endsWith("/deliverables")) throw new Error(`Legacy deliverables link failed: ${page.url()}`);

  console.log(JSON.stringify({ baseUrl, deepLink: "ok", guest: "ok", stories: stories.length, publicDeliverables: "ok", downloads: expected.length }));
} finally {
  await browser.close();
}
