import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "tmp", "site-screenshots");
const siteUrl = process.env.ATLAS_SITE_URL ?? "http://127.0.0.1:5173";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function settle() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await page.waitForTimeout(350);
}

await page.goto(`${siteUrl}/login`, { waitUntil: "networkidle" });
await settle();
await page
  .locator(".auth-main")
  .screenshot({ path: path.join(output, "01-login.png") });
await page.getByRole("button", { name: "Continue without signing in" }).click();
await page.getByRole("table").waitFor();
await page.locator(".recharts-responsive-container").first().waitFor();
await settle();

await page
  .locator(".hero-intro")
  .screenshot({ path: path.join(output, "02-hero.png") });
await page.locator("#scope").hover();
await page
  .getByRole("button", { name: "Pin", exact: true })
  .click({ force: true });
await settle();
await page
  .locator(".filter-rail")
  .screenshot({ path: path.join(output, "03-filters-controls.png") });
await page
  .locator(".rail-content")
  .evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
await settle();
await page
  .locator(".filter-rail")
  .screenshot({ path: path.join(output, "03-filters-selection.png") });
await page
  .locator(".rail-content")
  .evaluate((element) => element.scrollTo({ top: 0 }));
const railHeight = await page
  .locator(".rail-content")
  .evaluate((element) => element.scrollHeight);
await page.setViewportSize({ width: 1440, height: railHeight + 78 });
await settle();
await page
  .locator(".filter-rail")
  .screenshot({ path: path.join(output, "03-filters.png") });
await page.setViewportSize({ width: 1440, height: 900 });
await page
  .getByRole("button", { name: "Unpin", exact: true })
  .click({ force: true });
await page.keyboard.press("Escape");

await page
  .getByTestId("story-europe-price-peak")
  .getByRole("button", { name: "Open this view" })
  .click();
await page.locator("#stories").scrollIntoViewIfNeeded();
await settle();
await page.evaluate(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  for (const selector of [".atlas-header", ".skip-link"]) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) element.style.display = "none";
  }
});
await page
  .locator("#stories")
  .screenshot({ path: path.join(output, "04-stories.png") });
await page.evaluate(() => {
  for (const selector of [".atlas-header", ".skip-link"]) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) element.style.removeProperty("display");
  }
});

for (const [selector, name] of [
  ["#map", "04-map.png"],
  ["#signals", "05-signals.png"],
  ["#charts", "06-charts.png"],
  ["#evidence", "07-evidence.png"],
]) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await settle();
  await page.locator(selector).screenshot({ path: path.join(output, name) });
}

await page.goto(`${siteUrl}/deliverables`, { waitUntil: "networkidle" });
await settle();
await page.locator("#deliverables").scrollIntoViewIfNeeded();
await page
  .locator("#deliverables")
  .screenshot({ path: path.join(output, "08-deliverables.png") });

await context.close();
await browser.close();
console.log(output);
