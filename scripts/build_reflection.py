from __future__ import annotations

import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts"
SOURCE = OUT / "reflection.md"
OUTPUT = OUT / "global-energy-atlas-reflection.pdf"
SUMMARY = json.loads((OUT / "analysis-summary.json").read_text(encoding="utf-8"))

GREEN = colors.HexColor("#087F5B")
INK = colors.HexColor("#17201C")
MUTED = colors.HexColor("#59645D")
LINE = colors.HexColor("#D9D9D9")


def country(story: dict, code: str) -> dict:
    return next(item for item in story["countries"] if item["iso3"] == code)


def write_markdown() -> str:
    expanded = SUMMARY["expanded50"]
    assignment = SUMMARY["assignment15"]
    boundaries = SUMMARY["evidenceBoundaries"]
    stories = expanded["stories"]
    descriptive = expanded["descriptive"]
    relationships = expanded["relationships"]
    europe = stories["europePricePeak"]
    ethiopia_story = stories["ethiopiaPriceStructure"]
    consumption = stories["chinaUsConsumption"]
    balance = stories["energyBalanceSplit"]
    italy = country(europe, "ITA")
    germany = country(europe, "DEU")
    belgium = country(europe, "BEL")
    ethiopia = country(ethiopia_story, "ETH")
    algeria = country(ethiopia_story, "DZA")
    norway = country(ethiopia_story, "NOR")
    iceland = country(ethiopia_story, "ISL")
    china = country(balance, "CHN")
    india = country(balance, "IND")
    russia = country(balance, "RUS")
    united_states = country(balance, "USA")
    shortlist = ["China", "India", "the United States", "Ethiopia", "Norway", "Italy", "Algeria"]
    descriptive_status = boundaries["descriptive"]["status"]
    diagnostic_status = boundaries["diagnostic"]["status"]
    predictive_status = boundaries["predictive"]["status"].replace("notPerformed", "not performed")
    prescriptive_status = boundaries["prescriptive"]["status"].replace("notPerformed", "not performed")
    markdown = f"""# Global Energy Decision Atlas Reflection

## What the data supports

I would use the atlas as a first screen for national energy questions. It compares retail electricity prices, domestic generation structure, primary energy consumption, and an energy balance measure without folding them into one score. That separation matters. A low national price does not settle the cost of power for a facility, and a high non-fossil share does not describe the contract that a buyer can obtain. The atlas helps a reviewer decide where to investigate. It does not decide where to invest.

The descriptive work is concrete. Expanded 50 contains {expanded['records']} markets. Household price is reported for {descriptive['householdPriceUsdPerKwh']['n']}/{descriptive['householdPriceUsdPerKwh']['total']} markets and business price for {descriptive['businessPriceUsdPerKwh']['n']}/{descriptive['businessPriceUsdPerKwh']['total']}. Consumption, electricity mix, and the derived balance gap each cover {descriptive['primaryEnergyConsumptionEj']['n']}/{descriptive['primaryEnergyConsumptionEj']['total']}. The analysis measures coverage, extrema, ranks, concentration, and complete-case Pearson correlations. It also compares the same fixed market groups in each story view. These are descriptive results. They show what appears in the snapshot and how the reported values relate across complete observations.

The sample and measurements set hard limits. The {expanded['records']}-market scope is non-random and reflects market selection plus data availability, so it is not a representative global sample. Missing values reduce each calculation's denominator. Indicators combine different reference years, and a flagged fallback may carry a value back by no more than two years. National averages hide customer class, demand charges, connection costs, local congestion, outage history, and contract terms. Source definitions and accounting boundaries can differ. The correlations omit incomplete pairs, and this analysis calculates neither confidence intervals nor statistical significance.

The two datasets also use different balance concepts. Assignment 15 contains {assignment['records']} markets and preserves the supplied net-import field. Expanded 50 calculates primary energy consumption minus total energy production. That gap is an accounting proxy, not an observed trade flow. A positive gap does not prove import dependence, and a negative gap does not describe what a particular grid or facility exports. I therefore keep the scopes separate and avoid a combined ranking.

The limited diagnostic work forms hypotheses rather than explanations. Correlations and linked IEA, Eurostat, World Bank, or EIA context can suggest questions worth checking. They cannot show why an observed price, mix, demand, reliability, or balance value occurred. A causal claim would need matched historical data, local tariff and reliability records, and a stated identification design. None of those elements is present here.

<!-- pagebreak -->

## Four data stories

### Europe's price high point

Italy has the highest reported household price in Expanded 50 at {italy['householdPriceUsdPerKwh']:.3f} USD/kWh and the highest business price at {italy['businessPriceUsdPerKwh']:.3f} USD/kWh. Germany and Belgium each report {germany['householdPriceUsdPerKwh']:.3f} USD/kWh for households. The fixed view also includes Switzerland and Denmark and applies one map and sort order to the group. IEA and Eurostat context suggests possible questions about wholesale conditions, taxes, levies, and network charges. It does not establish which component produced the ranking. The practical next step is to request a current industrial tariff breakdown and actual contract terms before using the national price in a site model.

### Ethiopia's price and structure contrast

Ethiopia reports the lowest household price at {ethiopia['householdPriceUsdPerKwh']:.3f} USD/kWh. It also reports {ethiopia['nonFossilElectricityPct']:.1f} percent non-fossil generation, including {ethiopia['hydroElectricityPct']:.1f} percent hydro. The comparison places Ethiopia beside Algeria, Norway, Iceland, and Italy. Algeria's non-fossil share is {algeria['nonFossilElectricityPct']:.1f} percent, while Norway and Iceland report {norway['nonFossilElectricityPct']:.1f} and {iceland['nonFossilElectricityPct']:.1f} percent. Those values expose a useful contrast without making the systems equivalent. World Bank context points to access expansion, system investment, and financing as diligence topics for Ethiopia. A location case still needs available connection capacity, interruption records, customer-class rules, and enforceable supply terms.

### Consumption scale in China and the United States

The reported consumption total is {consumption['reportedConsumptionTotalEj']:.1f} EJ. China accounts for {consumption['chinaSharePct']:.1f} percent and the United States for {consumption['unitedStatesSharePct']:.1f} percent. Together they represent {consumption['combinedSharePct']:.1f} percent, while the five largest markets account for {consumption['topFiveSharePct']:.1f} percent. The fixed view adds India, Russia, and Japan. Population, industrial activity, and sector demand are plausible contributors, and IEA material provides current context for China, but this snapshot does not test those explanations. For portfolio work, I would rerun conclusions with and without China and the United States. Counting countries would understate the concentration.

### Diverging energy balance positions

The derived balance gap places China at +{china['energyBalanceGapEj']:.1f} EJ and India at +{india['energyBalanceGapEj']:.1f} EJ. Russia is at {russia['energyBalanceGapEj']:.1f} EJ and the United States at {united_states['energyBalanceGapEj']:.1f} EJ. Positive means consumption exceeds production in this calculation; negative means production exceeds consumption. EIA country material can guide follow-up questions, but the underlying accounting and actual trade flows still need verification. Large absolute gaps identify where to request observed imports and exports, fuel exposure, and reliability evidence. They do not establish supply risk by themselves.

<!-- pagebreak -->

## Analysis status and next diligence

The analytical maturity is explicit. Descriptive analysis is **{descriptive_status}**. Diagnostic analysis is **{diagnostic_status}** because the correlations and external sources only support hypotheses. Predictive analysis is **{predictive_status}**. There is no continuous time series, defined forecast target, training and validation split, or error evaluation. The atlas therefore cannot predict future electricity prices, demand, reliability, or emissions. Prescriptive analysis is **{prescriptive_status}**. There is no objective function, decision weighting, location constraint set, capital-cost model, actual contract book, or verified grid-capacity input. The atlas cannot prove a best market, an investment return, or an optimal site.

The complete-case correlations belong inside that descriptive boundary. Household price and non-fossil share have Pearson r={relationships['householdPriceVsNonFossil']['r']:.3f} across n={relationships['householdPriceVsNonFossil']['n']} pairs. Business price and non-fossil share have r={relationships['businessPriceVsNonFossil']['r']:.3f} across n={relationships['businessPriceVsNonFossil']['n']}. Household price and consumption have r={relationships['householdPriceVsConsumption']['r']:.3f} across n={relationships['householdPriceVsConsumption']['n']}. These associations can challenge simple assumptions. They do not supply causal mechanisms, confidence intervals, or forecasts.

My {len(shortlist)}-country diligence shortlist is {', '.join(shortlist[:-1])}, and {shortlist[-1]}. It is a varied set of cases, not a ranking of winners. China and India combine scale with positive balance gaps. The United States adds scale and a negative position. Ethiopia and Norway test different high non-fossil systems. Italy represents the price high point, and Algeria adds a low-price, low-non-fossil contrast. The purpose is to learn more from the next evidence request than a group of similar markets would allow.

The first request should cover the tariff available to the proposed customer class. For each candidate, I would ask for the current energy charge, demand charge, time-of-use rules, taxes and levies, escalation terms, and eligibility thresholds. Site evidence should cover connection capacity, upgrade cost, lead time, curtailment rules, outage frequency and duration, and power-quality records. If a power purchase agreement is possible, the review needs its tenor, indexation, settlement point, shape risk, credit support, and treatment of environmental attributes.

The team should also reconcile national evidence with the facility decision. It should document actual imports and exports, their accounting basis, and the most recent production and consumption years. It should separate grid-average generation from the contracted supply product and confirm which environmental attributes apply to the facility. Local counsel should verify licensing, market access, foreign-exchange exposure, and contract enforceability.

This is procedural diligence, not prescriptive optimization. The checklist can determine what to investigate and in what order. It cannot choose a site until the decision objective, weights, constraints, costs, contracts, and grid capacity are specified. I would return to the atlas after that package arrives, rerun the fixed comparisons, and change the shortlist when the local evidence warrants it.
"""
    SOURCE.write_text(markdown, encoding="utf-8")
    return markdown


styles = getSampleStyleSheet()
title = ParagraphStyle("ReflectionTitle", parent=styles["Title"], fontName="Times-Roman", fontSize=24, leading=27, textColor=INK, alignment=TA_LEFT, spaceAfter=12)
heading = ParagraphStyle("ReflectionHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=14, textColor=INK, spaceBefore=8, spaceAfter=4, keepWithNext=True)
subheading = ParagraphStyle("ReflectionSubheading", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=10.3, leading=12.2, textColor=GREEN, spaceBefore=6, spaceAfter=2.5, keepWithNext=True)
body = ParagraphStyle("ReflectionBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=11.9, textColor=INK, spaceAfter=4.8, splitLongWords=False)
kicker = ParagraphStyle("Kicker", fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=GREEN, tracking=1.0, spaceAfter=6)


class ReflectionDocument(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(filename, pagesize=letter, leftMargin=.68*inch, rightMargin=.68*inch, topMargin=.58*inch, bottomMargin=.6*inch, title="Global Energy Decision Atlas Leadership Reflection", author="Zhekai Li")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="reflection", frames=[frame], onPage=self.draw_page))

    @staticmethod
    def draw_page(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(.5)
        canvas.line(document.leftMargin, .43*inch, letter[0]-document.rightMargin, .43*inch)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8.2)
        canvas.drawString(document.leftMargin, .25*inch, "© 2026 Zhekai Li")
        canvas.drawRightString(letter[0]-document.rightMargin, .25*inch, f"{canvas.getPageNumber()}")
        canvas.restoreState()


def build_pdf(markdown: str) -> None:
    story = []
    paragraph_buffer: list[str] = []

    def flush() -> None:
        if not paragraph_buffer:
            return
        text = " ".join(paragraph_buffer).strip()
        text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
        story.append(Paragraph(text, body))
        paragraph_buffer.clear()

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        if not line:
            flush()
        elif line == "<!-- pagebreak -->":
            flush()
            story.append(PageBreak())
        elif line.startswith("# "):
            flush()
            story.append(Paragraph(line[2:], title))
            story.append(Paragraph("EVIDENCE, LIMITS, AND NEXT DILIGENCE", kicker))
        elif line.startswith("## "):
            flush()
            story.append(Paragraph(line[3:], heading))
        elif line.startswith("### "):
            flush()
            story.append(Paragraph(line[4:], subheading))
        else:
            paragraph_buffer.append(line)
    flush()
    ReflectionDocument(str(OUTPUT)).build(story)


if __name__ == "__main__":
    markdown = write_markdown()
    build_pdf(markdown)
    words = re.findall(r"\b[\w'-]+\b", re.sub(r"<!--.*?-->|^#+\s+", "", markdown, flags=re.MULTILINE))
    print(f"{SOURCE} ({len(words)} words)")
    print(OUTPUT)
