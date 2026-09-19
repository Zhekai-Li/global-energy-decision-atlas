import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import rawExpanded from "../../data/expanded-energy-50-v1.csv?raw";
import deliverableManifest from "../../data/deliverables.json";
import App from "../App";
import { parseExpandedCsv } from "../data-v2";
import { AtlasPage } from "../pages/AtlasPage";
import { DEFAULT_STATE, reconcileState } from "../state";
import type { DashboardState } from "../types";

const apiMocks = vi.hoisted(() => ({
  fetchAtlasRecords: vi.fn(),
  fetchProfile: vi.fn(),
  fetchSavedViews: vi.fn(),
  saveProfile: vi.fn(),
  createSavedView: vi.fn(),
  renameSavedView: vi.fn(),
  deleteSavedView: vi.fn(),
}));

vi.mock("../lib/api", () => apiMocks);

const records = parseExpandedCsv(rawExpanded);
const assignmentCodes = new Set([
  "CHN",
  "USA",
  "IND",
  "RUS",
  "JPN",
  "CAN",
  "DEU",
  "BRA",
  "KOR",
  "IRN",
  "SAU",
  "IDN",
  "FRA",
  "MEX",
  "GBR",
]);
const recordsWithAssignment = [
  ...records,
  ...records
    .filter((record) => assignmentCodes.has(record.iso3))
    .map((record) => ({ ...record, datasetScope: "assignment-15" as const })),
];

describe("public and protected routes", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("shows only the public brand page before login", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Make energy tradeoffs visible." }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(/2\.0|Version 2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/© \d{4} Zhekai Li/)).toBeInTheDocument();
  });

  it("opens the public deliverables route without a guest or account session", async () => {
    window.history.replaceState({}, "", "/deliverables");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Course deliverables and source files" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    const names = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("download"))
      .filter(Boolean);
    expect(names).toEqual(
      deliverableManifest.groups.flatMap((group) =>
        group.files.map((file) => file.downloadName),
      ),
    );
  });

  it("redirects legacy deliverables hashes to the public route", async () => {
    window.history.replaceState({}, "", "/atlas#deliverables");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Course deliverables and source files" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/deliverables");
  });

  it("redirects a direct atlas visit to the login page", async () => {
    window.history.replaceState({}, "", "/atlas");
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });

  it("explains missing deployment authentication configuration", async () => {
    window.history.replaceState({}, "", "/login");
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Email"), "analyst@example.com");
    await user.type(screen.getByLabelText("Password"), "long-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      screen.getAllByText(
        "Authentication is not configured for this deployment.",
      ).length,
    ).toBeGreaterThan(0);
  });

  it("allows a guest to skip login and explains the persistence limits", async () => {
    window.history.replaceState({}, "", "/login");
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByText(/cannot save customized views or activity history/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Continue without signing in" }),
    );
    expect(
      await screen.findByRole("button", { name: "Guest" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Saved views" }),
    ).not.toBeInTheDocument();
  });
});

describe("atlas interactions with protected records supplied by the test harness", () => {
  const state = reconcileState(
    { ...DEFAULT_STATE, selectionMode: "regions", regionIds: ["global"] },
    records,
  );
  const renderAtlas = () =>
    render(
      <AtlasPage
        userId="test-user"
        email="analyst@example.com"
        initialState={state}
        records={records}
        onStateChange={() => undefined}
        onSignOut={() => undefined}
      />,
    );

  it("defaults global members to eight focus countries by consumption", () => {
    renderAtlas();
    expect(
      screen.getByRole("heading", { name: /Focus countries/ }),
    ).toHaveTextContent("8/8");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("enforces four selected regions and exposes overlap guidance", async () => {
    const user = userEvent.setup();
    renderAtlas();
    await user.click(screen.getByRole("checkbox", { name: "Global" }));
    for (const region of ["Europe", "Nordics", "East Asia", "Asia-Pacific"])
      await user.click(screen.getByRole("checkbox", { name: region }));
    expect(
      screen.getByText(/belong to more than one selected region/),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Africa" })).toBeDisabled();
  });

  it("switches to aggregate mode and downloads stable machine fields", async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderAtlas();
    await user.click(screen.getByRole("button", { name: "Aggregate" }));
    expect(
      within(screen.getByRole("table")).getByText("Global"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Download CSV" }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });

  it("provides hierarchical navigation and an explicit map legend", async () => {
    const user = userEvent.setup();
    renderAtlas();
    expect(screen.getByRole("link", { name: "Atlas" })).toHaveAttribute(
      "href",
      "#atlas-top",
    );
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    await user.hover(screen.getByRole("button", { name: "Resources" }));
    expect(screen.getByText("Data & definitions")).toBeInTheDocument();
    const legend = screen.getByRole("group", { name: "Map legend" });
    expect(legend).toHaveTextContent("USD/kWh");
    expect(within(legend).getByText("Analysis scope")).toBeInTheDocument();
    expect(within(legend).getByText("Focus country")).toBeInTheDocument();
  });

  it("opens navigation on hover and closes it when the pointer leaves", async () => {
    const user = userEvent.setup();
    renderAtlas();
    const explore = screen.getByRole("button", { name: "Explore" });
    expect(explore).toHaveAttribute("aria-expanded", "false");
    await user.hover(explore);
    expect(explore).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "World map" })).toBeVisible();
    await user.unhover(explore.closest(".nav-disclosure")!);
    expect(explore).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: "World map" }),
    ).not.toBeInTheDocument();
  });

  it("keeps navigation-style preferences separate from account state and explains price audiences", async () => {
    const user = userEvent.setup();
    renderAtlas();
    const header = screen.getByRole("banner");
    const language = within(header).getByRole("button", { name: "Language" });
    const theme = within(header).getByRole("button", { name: "Theme" });
    expect(language).toHaveAttribute("aria-expanded", "false");
    expect(theme).toHaveAttribute("aria-expanded", "false");
    expect(
      within(header).getByRole("button", { name: /analyst@example.com/ }),
    ).toBeVisible();
    expect(
      screen.getByText(/Household uses residential retail prices/),
    ).toBeInTheDocument();
    await user.hover(language);
    expect(language).toHaveAttribute("aria-expanded", "true");
    expect(
      within(header).getByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.unhover(language.closest(".header-dropdown")!);
    expect(language).toHaveAttribute("aria-expanded", "false");
  });

  it("explains the selected map metric below its control", async () => {
    const user = userEvent.setup();
    renderAtlas();
    const guide = screen.getByRole("region", { name: "Map metric guide" });
    expect(guide).toHaveTextContent("USD/kWh");
    expect(guide).toHaveTextContent(/total primary energy consumption/i);
    expect(guide).toHaveTextContent("EJ");
    expect(guide).toHaveTextContent("Non-fossil electricity");
    expect(guide).toHaveTextContent("%");
    expect(
      within(guide).getByText(
        /selected Household or Business retail electricity price/,
      ),
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Map metric"),
      "consumption",
    );
    expect(
      within(guide).getByText(
        /total primary energy consumption in EJ; not per-capita use/,
      ),
    ).toBeInTheDocument();
  });

  it("opens, pins, unpins, and dismisses the filter rail with Escape", async () => {
    const user = userEvent.setup();
    renderAtlas();
    const rail = screen.getByRole("complementary", {
      name: "Analysis controls",
    });
    await user.hover(rail);
    expect(rail).toHaveClass("is-open");
    await user.click(screen.getByRole("button", { name: "Pin" }));
    expect(rail).toHaveClass("is-pinned");
    await user.click(screen.getByRole("button", { name: "Unpin" }));
    await user.keyboard("{Escape}");
    expect(rail).not.toHaveClass("is-open");
  });

  it("opens the filter rail from the hero and focuses the first control", async () => {
    const user = userEvent.setup();
    renderAtlas();
    const rail = screen.getByRole("complementary", {
      name: "Analysis controls",
    });
    await user.click(screen.getByRole("link", { name: "Configure view" }));
    expect(rail).toHaveClass("is-open");
    expect(window.location.hash).toBe("#scope");
    expect(screen.getByRole("button", { name: "Assignment 15" })).toHaveFocus();
  });

  it("opens the filter rail from navigation while preserving the scope hash", async () => {
    const user = userEvent.setup();
    renderAtlas();
    await user.hover(screen.getByRole("button", { name: "Analysis" }));
    await user.click(screen.getByRole("link", { name: "Scope & filters" }));
    expect(
      screen.getByRole("complementary", { name: "Analysis controls" }),
    ).toHaveClass("is-open");
    expect(window.location.hash).toBe("#scope");
    expect(screen.getByRole("button", { name: "Assignment 15" })).toHaveFocus();
  });

  it("shows the four analysis levels and their exact statuses", () => {
    renderAtlas();
    expect(screen.getByText("Descriptive").closest("article")).toHaveAttribute("data-boundary-status", "performed");
    expect(screen.getByText("Diagnostic").closest("article")).toHaveAttribute("data-boundary-status", "partial");
    expect(screen.getByText("Predictive").closest("article")).toHaveAttribute("data-boundary-status", "notPerformed");
    const prescriptive = screen.getByText("Prescriptive").closest("article");
    expect(prescriptive).toHaveAttribute("data-boundary-status", "notPerformed");
    expect(prescriptive).toHaveTextContent(/Does not prove: A best market/i);
  });

  it("updates narrative evidence and sample metadata with the map metric", async () => {
    const user = userEvent.setup();
    renderAtlas();
    expect(screen.getByTestId("insight-metric-price")).toHaveTextContent(
      /Data used: \d+ of \d+ markets/,
    );
    await user.selectOptions(
      screen.getByLabelText("Map metric"),
      "consumption",
    );
    expect(screen.getByTestId("insight-metric-consumption")).toHaveTextContent(
      "Scale and portfolio weight",
    );
    expect(screen.getByTestId("insight-metric-consumption")).toHaveTextContent(
      /covered dataset consumption/,
    );
  });

  it("applies an exact story configuration, announces it, and clears active state after a manual change", async () => {
    const user = userEvent.setup();
    const changes: DashboardState[] = [];
    render(
      <AtlasPage
        userId="test-user"
        email="analyst@example.com"
        initialState={{ ...state, locale: "en", theme: "dark" }}
        records={records}
        onStateChange={(next) => changes.push(next)}
        onSignOut={() => undefined}
      />,
    );
    const card = screen.getByTestId("story-ethiopia-price-structure");
    await user.click(within(card).getByRole("button", { name: "Open this view" }));
    expect(card).toHaveClass("is-active");
    expect(screen.getByText(/Ethiopia price and structure view applied/)).toBeInTheDocument();
    expect(changes.at(-1)).toMatchObject({
      datasetScope: "expanded-50",
      selectionMode: "countries",
      regionIds: ["global"],
      countryCodes: ["ETH", "ISL", "NOR", "DZA", "ITA"],
      focusCountryCodes: ["ETH", "ISL", "NOR", "DZA", "ITA"],
      regionDisplayMode: "members",
      priceAudience: "household",
      mapMetric: "nonFossil",
      sortMetric: "nonFossil",
      locale: "en",
      theme: "dark",
    });
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    await user.selectOptions(screen.getByLabelText("Map metric"), "price");
    expect(card).not.toHaveClass("is-active");
  });

  it("gives every stable navigation hash exactly one target", () => {
    renderAtlas();
    for (const id of [
      "atlas-top",
      "scope",
      "map",
      "signals",
      "charts",
      "evidence",
      "saved-views",
      "methodology",
      "evidence-boundaries",
      "dataset-scopes",
      "provenance",
    ]) {
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(1);
    }
    expect(screen.getByRole("link", { name: "Deliverables" })).toHaveAttribute("href", "/deliverables");
  });

  it("offers only region presets represented in the active dataset", async () => {
    const user = userEvent.setup();
    const combinedState = reconcileState(state, recordsWithAssignment);
    render(
      <AtlasPage
        userId="test-user"
        email="analyst@example.com"
        initialState={combinedState}
        records={recordsWithAssignment}
        onStateChange={() => undefined}
        onSignOut={() => undefined}
      />,
    );
    expect(
      screen.getByRole("checkbox", { name: "Nordics" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Assignment 15" }));
    expect(
      screen.queryByRole("checkbox", { name: "Nordics" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Africa" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Europe" }),
    ).toBeInTheDocument();
  });
});

describe("atlas account-state synchronization", () => {
  const state = reconcileState(
    { ...DEFAULT_STATE, selectionMode: "regions", regionIds: ["global"] },
    records,
  );

  it("does not rehydrate and roll back an interaction when the parent mirrors state", async () => {
    apiMocks.fetchAtlasRecords.mockResolvedValue(records);
    apiMocks.fetchProfile.mockResolvedValue({
      theme: null,
      locale: null,
      dashboardState: state,
    });
    apiMocks.fetchSavedViews.mockResolvedValue([]);
    apiMocks.saveProfile.mockResolvedValue(undefined);
    const user = userEvent.setup();
    function Harness() {
      const [mirrored, setMirrored] = useState(state);
      return (
        <AtlasPage
          userId="test-user"
          email="analyst@example.com"
          initialState={mirrored}
          onStateChange={setMirrored}
          onSignOut={() => undefined}
        />
      );
    }
    render(<Harness />);
    await screen.findByRole("table");
    expect(apiMocks.fetchProfile).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Aggregate" }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    expect(screen.getByRole("button", { name: "Aggregate" })).toHaveClass(
      "active",
    );
    expect(apiMocks.fetchProfile).toHaveBeenCalledTimes(1);
  });
});
