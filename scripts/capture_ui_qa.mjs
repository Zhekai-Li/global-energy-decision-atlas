import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "tmp", "ui-qa");
const siteUrl = process.env.ATLAS_SITE_URL ?? "http://127.0.0.1:5173";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function openGuest(page) {
  await page.goto(`${siteUrl}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue without signing in" }).click();
  await page.getByRole("table").waitFor();
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  if (overflow.body > 1 || overflow.document > 1) {
    throw new Error(`${label} horizontal overflow: ${JSON.stringify(overflow)}`);
  }
}

async function captureDesktopEnglishLight() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openGuest(page);
  await page.locator("#evidence-boundaries").scrollIntoViewIfNeeded();
  await assertNoHorizontalOverflow(page, "desktop English light");
  await page.screenshot({ path: path.join(output, "desktop-en-light.png"), fullPage: false });
  await page.goto(`${siteUrl}/deliverables`, { waitUntil: "networkidle" });
  await assertNoHorizontalOverflow(page, "public deliverables English light");
  await page.screenshot({ path: path.join(output, "desktop-deliverables-en-light.png"), fullPage: false });
  await context.close();
}

async function captureDesktopArabicDark() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openGuest(page);
  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("button", { name: "العربية" }).click();
  await page.getByRole("button", { name: "المظهر" }).click();
  await page.getByRole("button", { name: "داكن" }).click();
  await page.locator("#stories").scrollIntoViewIfNeeded();
  await assertNoHorizontalOverflow(page, "desktop Arabic dark");
  await page.screenshot({ path: path.join(output, "desktop-ar-dark.png"), fullPage: false });
  await context.close();
}

async function captureMobile(locale, label, dark = false) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await openGuest(page);
  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("button", { name: locale }).click();
  if (dark) {
    const themeName = locale === "العربية" ? "المظهر" : "主题";
    const darkName = locale === "العربية" ? "داكن" : "深色";
    await page.getByRole("button", { name: themeName }).click();
    await page.getByRole("button", { name: darkName }).click();
  }
  await page.locator("#stories").scrollIntoViewIfNeeded();
  await assertNoHorizontalOverflow(page, label);
  await page.screenshot({ path: path.join(output, `${label}.png`), fullPage: false });
  await page.locator("#signals").scrollIntoViewIfNeeded();
  await assertNoHorizontalOverflow(page, `${label} signals`);
  await page.screenshot({ path: path.join(output, `${label}-signals.png`), fullPage: false });
  await context.close();
}

await captureDesktopEnglishLight();
await captureDesktopArabicDark();
await captureMobile("简体中文", "mobile-zh-light");
await captureMobile("العربية", "mobile-ar-dark", true);
await browser.close();
console.log(output);
