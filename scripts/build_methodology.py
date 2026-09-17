from pathlib import Path
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts"
OUT.mkdir(exist_ok=True)
path = OUT / "global-energy-atlas-methodology.docx"

INK = "20251F"
GREEN = "176B54"
PALE = "E8EEE8"
LINE = "D4CEC0"
MUTED = "62675F"

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(0.48)
sec.bottom_margin = Inches(0.46)
sec.left_margin = Inches(0.58)
sec.right_margin = Inches(0.58)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Arial"
normal.font.size = Pt(8.25)
normal.font.color.rgb = RGBColor.from_string(INK)
normal.paragraph_format.space_after = Pt(3.5)
normal.paragraph_format.line_spacing = 1.03

title = styles["Title"]
title.font.name = "Georgia"
title.font.size = Pt(22)
title.font.bold = False
title.font.color.rgb = RGBColor.from_string("000000")
title.paragraph_format.space_after = Pt(4)

for name, size in [("Heading 1", 11.5), ("Heading 2", 9.5)]:
    style = styles[name]
    style.font.name = "Arial"
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string("000000")
    style.paragraph_format.space_before = Pt(5)
    style.paragraph_format.space_after = Pt(2.5)
    style.paragraph_format.keep_with_next = True

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)

def borders(cell, color=LINE):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = OxmlElement(f"w:{edge}")
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), "4")
        tag.set(qn("w:color"), color)
        tc_borders.append(tag)

def add_heading(text):
    p = doc.add_paragraph(text, style="Heading 1")
    return p

def add_para(text, bold_lead=None):
    p = doc.add_paragraph()
    if bold_lead and text.startswith(bold_lead):
        r = p.add_run(bold_lead)
        r.bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)
    return p

p = doc.add_paragraph("Global Energy Decision Atlas Methodology Note", style="Title")
p.alignment = WD_ALIGN_PARAGRAPH.LEFT
for run in p.runs:
    run.font.name = "Georgia"
    run.font.size = Pt(22)
    run.font.color.rgb = RGBColor(0, 0, 0)
p_ppr = p._p.get_or_add_pPr()
p_bdr = OxmlElement("w:pBdr")
bottom = OxmlElement("w:bottom")
bottom.set(qn("w:val"), "nil")
p_bdr.append(bottom)
p_ppr.append(p_bdr)
sub = doc.add_paragraph()
sub.paragraph_format.space_after = Pt(6)
r = sub.add_run("Decision support for business energy and sustainability teams  |  Prepared 17 September 2026")
r.font.name = "Arial"
r.font.size = Pt(8.5)
r.font.bold = True
r.font.color.rgb = RGBColor.from_string(GREEN)

intro = doc.add_paragraph()
intro.paragraph_format.space_after = Pt(5)
intro.add_run("Purpose  ").bold = True
intro.add_run("The site compares national electricity price, generation mix, total energy consumption, and trade exposure across 15 countries. It supports early market screening. It does not replace a facility tariff study, procurement review, or supply reliability assessment.")

add_heading("Data collection and provenance")
add_para("The assignment supplied a single CSV. The project stores that file unchanged and bundles it with the site, so the dashboard makes no runtime data or API requests. The CSV combines retail price pages from GlobalPetrolPrices, national consumption from Worldometer, electricity mix from Our World in Data and Ember, total energy balances from the International Energy Agency, and electricity trade from the US Energy Information Administration. Source URLs remain in the file. We accessed the supplied CSV on 17 September 2026.")

table = doc.add_table(rows=1, cols=4)
table.autofit = False
headers = ["Measure", "Reference date", "Unit", "Interpretation"]
widths = [1.42, 1.28, 1.18, 3.35]
for i, (cell, text, width) in enumerate(zip(table.rows[0].cells, headers, widths)):
    cell.width = Inches(width)
    cell.text = text
    shade(cell, GREEN)
    borders(cell)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for run in cell.paragraphs[0].runs:
        run.font.color.rgb = RGBColor(255,255,255)
        run.font.bold = True
        run.font.size = Pt(7.5)
for values in [
    ("Retail electricity price", "December 2025", "USD/kWh and local currency/kWh", "Household annual average use; business use of 1,000,000 kWh/year"),
    ("Total energy consumption", "2024", "Exajoules", "Absolute national total, not per capita or electricity-only use"),
    ("Electricity generation mix", "2024", "Percent of domestic generation", "Generation rather than capacity or electricity consumed"),
    ("Total energy trade", "2023", "Exajoules", "Gross cross-border flows; net imports equal imports minus exports"),
]:
    cells = table.add_row().cells
    for i, (cell, text, width) in enumerate(zip(cells, values, widths)):
        cell.width = Inches(width)
        cell.text = text
        shade(cell, "FFFFFF" if len(table.rows) % 2 else PALE)
        borders(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for p0 in cell.paragraphs:
            p0.paragraph_format.space_after = Pt(0)
            for run in p0.runs:
                run.font.size = Pt(7.2)

add_heading("Validation and derived measures")
add_para("The parser requires 15 unique country rows and 49 named columns. It checks numeric fields, URLs, percentages from 0 to 100, and electricity and primary energy mix totals within 0.11 percentage points of 100. It also verifies that Iran is the only record with both USD price fields missing. The stored file has SHA-256 c6a83dd39fd0215a4ddcf5d11e15f6b3c36197230b326c2425588ee8067e7caa.")
add_para("Non-fossil electricity equals solar + wind + hydro + other. Fossil electricity equals gas + coal + oil and other fossil. Selected price uses the household or business field chosen by the user. Positive net imports indicate a net importer; negative values indicate a net exporter. Missing values display as N/A and leave any calculation that requires the missing metric.")

add_heading("Bias uncertainty and limitations")
items = [
    "The 15-country set covers major energy consumers but does not represent every market or region.",
    "Reference years differ, so the views do not describe one common period and cannot support causal claims.",
    "USD price comparisons inherit exchange-rate uncertainty; the source does not specify the conversion date.",
    "National consumption is absolute rather than per capita. It says nothing about a specific facility load or sector.",
    "The residual other generation category includes nuclear and other renewables. It is not one technology.",
    "Imports, exports, and domestic production do not directly measure price stability, grid reliability, or geopolitical risk.",
]
for item in items:
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Inches(0.16)
    p.paragraph_format.first_line_indent = Inches(-0.12)
    p.paragraph_format.space_after = Pt(1.2)
    p.add_run(item)

add_heading("Decision use and reflection")
add_para("The cross-sectional data can identify countries that combine a reported price, a less fossil-intensive electricity mix, and a chosen trade position. It can also expose tradeoffs that warrant local diligence. The data cannot prove that generation sources cause retail prices, predict future tariffs, rank locations on one defensible score, or establish that a net importer faces unreliable supply. Teams should confirm industrial tariffs, demand charges, time-of-use rules, renewable procurement options, and continuity requirements for each shortlisted facility.")

footer = sec.footer
fp = footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
fr = fp.add_run("GLOBAL ENERGY DECISION ATLAS   •   SUPPLIED CSV: 15 ROWS × 49 COLUMNS   •   STATIC LOCAL ANALYSIS")
fr.font.name = "Arial"
fr.font.size = Pt(6.8)
fr.font.bold = True
fr.font.color.rgb = RGBColor.from_string(MUTED)

doc.save(path)
print(path)
