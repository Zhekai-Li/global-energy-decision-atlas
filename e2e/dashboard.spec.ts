import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function openGuest(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("public landing contains no analytical data and routes to authentication", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Make energy tradeoffs visible." }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("link", { name: "Access the atlas" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("direct protected route redirects before making data available", async ({
  page,
}) => {
  await page.goto("/atlas");
  await expect(page).toHaveURL(/\/login\?next=/);
  await expect(
    page
      .getByText("Authentication is not configured for this deployment.")
      .first(),
  ).toBeVisible();
});

test("guest access opens the atlas without enabling saved views", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByText(/cannot save customized views or activity history/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  await expect(page).toHaveURL(/\/atlas$/);
  await expect(page.getByRole("button", { name: "Guest" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saved views" })).toHaveCount(
    0,
  );
});

test("filter rail supports desktop pinning, mobile dismissal, and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openGuest(page);
  const rail = page.getByRole("complementary", { name: "Analysis controls" });
  const mobile = (page.viewportSize()?.width ?? 0) < 1100;
  if (mobile)
    await page
      .getByRole("button", { name: "Configure view", exact: true })
      .click();
  else await rail.hover();
  await expect(rail).toHaveClass(/is-open/);
  expect(
    await rail.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    ),
  ).toMatch(/(?:1e-05|0\.00001)s/);
  if (mobile) {
    await rail.locator(".rail-close").click();
  } else {
    await page.getByRole("button", { name: "Pin", exact: true }).click();
    await expect(rail).toHaveClass(/is-pinned/);
    await page.getByRole("button", { name: "Unpin", exact: true }).click();
    await page.keyboard.press("Escape");
  }
  await expect(rail).not.toHaveClass(/is-open/);
});

test("signals, stable hashes, and guest navigation update with controls", async ({
  page,
}) => {
  await openGuest(page);
  const mobile = (page.viewportSize()?.width ?? 0) < 1100;
  const rail = page.getByRole("complementary", { name: "Analysis controls" });
  if (mobile)
    await page
      .getByRole("button", { name: "Configure view", exact: true })
      .click();
  else await rail.hover();
  await page
    .getByLabel("Map metric", { exact: true })
    .selectOption("consumption");
  await expect(page.getByTestId("insight-metric-consumption")).toContainText(
    "Scale and portfolio weight",
  );
  for (const id of [
    "atlas-top",
    "scope",
    "map",
    "signals",
    "charts",
    "evidence",
    "methodology",
    "evidence-boundaries",
    "dataset-scopes",
    "provenance",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await expect(page.getByRole("link", { name: "Deliverables" })).toHaveAttribute("href", "/deliverables");
  await expect(page.locator("#saved-views")).toHaveCount(0);
  if ((page.viewportSize()?.width ?? 0) >= 1100) {
    await page.getByRole("button", { name: "Analysis" }).hover();
    await expect(page.getByRole("link", { name: "Saved views" })).toHaveCount(
      0,
    );
    const scopeLink = page.getByRole("link", { name: "Scope & filters" });
    await expect(scopeLink).toHaveAttribute("href", "#scope");
    await scopeLink.click();
    await expect(page).toHaveURL(/#scope$/);
    await expect(rail).toHaveClass(/is-open/);
    await expect(
      page.getByRole("button", { name: "Assignment 15" }),
    ).toBeFocused();
  }
});

test("all four fixed story views apply their complete metric and sort configuration", async ({ page }) => {
  await openGuest(page);
  const cases = [
    ["europe-price-peak", "price"],
    ["ethiopia-price-structure", "nonFossil"],
    ["china-us-consumption", "consumption"],
    ["energy-balance-split", "tradeExposure"],
  ] as const;
  for (const [id, metric] of cases) {
    const card = page.getByTestId(`story-${id}`);
    await card.getByRole("button", { name: /Open this view|View active/ }).click();
    await expect(card).toHaveClass(/is-active/);
    await expect(page.getByLabel("Map metric", { exact: true })).toHaveValue(metric);
    await expect(
      page.getByRole("combobox", { name: "Sort by", exact: true }),
    ).toHaveValue(metric);
    await expect(page.locator("#map")).toBeInViewport();
  }
});

test("all public deliverables download with stable names and valid signatures", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  await page.goto("/deliverables");
  await expect(page).toHaveURL(/\/deliverables$/);
  await expect(page.getByRole("heading", { name: "Five course requirements" })).toBeVisible();
  const manifest = JSON.parse(
    await readFile(new URL("../data/deliverables.json", import.meta.url), "utf8"),
  ) as { groups: Array<{ files: Array<{ downloadName: string; signature: string }> }> };
  const expected = manifest.groups.flatMap((group) =>
    group.files.map((file) => [file.downloadName, file.signature] as const),
  );
  const links = page.locator("[data-deliverable-download]");
  await expect(links).toHaveCount(expected.length);
  await expect(links).toHaveCount(11);
  await expect(page.locator('[data-deliverable-download*="Presentation"]')).toHaveCount(4);
  for (let index = 0; index < (await links.count()); index += 1) {
    const href = await links.nth(index).getAttribute("href");
    expect(href).toBeTruthy();
    const response = await request.get(new URL(href!, page.url()).toString());
    expect(response.status()).toBe(200);
    const downloadPromise = page.waitForEvent("download");
    await links.nth(index).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(expected[index][0]);
    const downloadedPath = await download.path();
    expect(downloadedPath).toBeTruthy();
    const bytes = await readFile(downloadedPath!);
    const signature = expected[index][1];
    if (signature === "pdf")
      expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
    if (signature === "zip") expect(bytes.subarray(0, 2).toString()).toBe("PK");
    if (signature === "json")
      expect(bytes.toString("utf8").trimStart().startsWith("{")).toBe(true);
    if (signature === "markdown")
      expect(bytes.toString("utf8").startsWith("# ")).toBe(true);
    if (signature === "text")
      expect(bytes.toString("utf8", 0, 80)).toContain(",");
    // Chromium limits long runs of automatic downloads per page. A reload
    // preserves the public route while treating each verified file as a new
    // user-initiated download.
    await page.reload({ waitUntil: "networkidle" });
  }
});

test("atlas supports Chinese, Arabic RTL, and dark appearance", async ({
  page,
}) => {
  await openGuest(page);
  await page.getByRole("button", { name: "Language" }).click();
  await page.getByRole("button", { name: "简体中文" }).click();
  await expect(page.getByRole("heading", { name: "决策图谱" })).toBeVisible();
  await page.getByRole("button", { name: "语言" }).click();
  await page.getByRole("button", { name: "العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "المظهر" }).click();
  await page.getByRole("button", { name: "داكن" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("legacy methodology link preserves the protected deep link", async ({
  page,
}) => {
  await page.goto("/#methodology");
  await expect(page).toHaveURL(/\/login\?next=%2Fatlas%23methodology$/);
});

test("legacy deliverables hashes open the public page", async ({ page }) => {
  await page.goto("/atlas#deliverables");
  await expect(page).toHaveURL(/\/deliverables$/);
  await expect(page.getByRole("heading", { name: "Course deliverables and source files" })).toBeVisible();
});

test("theme, Chinese, and Arabic direction preferences work before login", async ({
  page,
}) => {
  await page.getByLabel("Theme").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("Language").selectOption("zh-CN");
  await expect(
    page.getByRole("heading", { name: "让能源取舍清晰可见。" }),
  ).toBeVisible();
  await page.getByLabel("语言").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("production bundle makes no external requests without a configured backend", async ({
  page,
}) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname))
      external.push(request.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
