from __future__ import annotations

import json
import re
import subprocess
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
EXPECTED_STATUSES = {
    "descriptive": "performed",
    "diagnostic": "partial",
    "predictive": "notPerformed",
    "prescriptive": "notPerformed",
}
CORE_LIMITS = (
    "future electricity prices",
    "best market",
    "optimal site",
    "not an observed trade flow",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def xml_text_from_zip(path: Path, prefix: str) -> str:
    namespace = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main", "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    chunks: list[str] = []
    with zipfile.ZipFile(path) as archive:
        for name in sorted(item for item in archive.namelist() if item.startswith(prefix) and item.endswith(".xml")):
            root = ET.fromstring(archive.read(name))
            chunks.extend(node.text or "" for node in root.findall(".//a:t", namespace))
            chunks.extend(node.text or "" for node in root.findall(".//w:t", namespace))
    return "\n".join(chunks)


def pdf_info(path: Path) -> str:
    return subprocess.run(["pdfinfo", str(path)], check=True, capture_output=True, text=True).stdout


def pdf_text(path: Path) -> str:
    return subprocess.run(["pdftotext", str(path), "-"], check=True, capture_output=True, text=True).stdout


def normalized(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


def pptx_text_and_counts(path: Path) -> tuple[str, int, int]:
    with zipfile.ZipFile(path) as archive:
        slides = [name for name in archive.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)]
        notes = [name for name in archive.namelist() if re.fullmatch(r"ppt/notesSlides/notesSlide\d+\.xml", name)]
    text = normalized(xml_text_from_zip(path, "ppt/slides/") + "\n" + xml_text_from_zip(path, "ppt/notesSlides/"))
    return text, len(slides), len(notes)


def require_signature(path: Path, signature: str) -> None:
    prefix = path.read_bytes()[:128]
    if signature == "pdf":
        require(prefix.startswith(b"%PDF"), f"{path.name} is not a PDF")
    elif signature == "zip":
        require(prefix.startswith(b"PK"), f"{path.name} is not a ZIP container")
    elif signature == "json":
        require(prefix.lstrip().startswith((b"{", b"[")), f"{path.name} is not JSON")
    elif signature == "markdown":
        require(prefix.startswith(b"# "), f"{path.name} is not Markdown")
    elif signature == "text":
        require(b"," in prefix, f"{path.name} is not CSV text")


summary = json.loads((ARTIFACTS / "analysis-summary.json").read_text(encoding="utf-8"))
statuses = {level: boundary["status"] for level, boundary in summary["evidenceBoundaries"].items()}
require(statuses == EXPECTED_STATUSES, f"Unexpected evidence boundary statuses: {statuses}")
for boundary in summary["evidenceBoundaries"].values():
    require(set(boundary) == {"status", "supports", "doesNotProve", "missingInputs", "nextWork"}, "Evidence boundary schema drift")

manifest = json.loads((ROOT / "data" / "deliverables.json").read_text(encoding="utf-8"))
files = [item for group in manifest["groups"] for item in group["files"]]
require(len(manifest["requirements"]) == 5, "The course checklist must contain five requirements")
require(len(files) == 11, "The public manifest must contain eleven files")
require(len({item["downloadName"] for item in files}) == 11, "Download names must be unique")
for item in files:
    path = ROOT / item["sourcePath"]
    require(path.is_file(), f"Missing deliverable: {item['sourcePath']}")
    require_signature(path, item["signature"])

presentation_group = next(group for group in manifest["groups"] if group["id"] == "presentation")
require(
    [item["id"] for item in presentation_group["files"]] == [
        "insightsPresentationPptx",
        "insightsPresentationPdf",
        "siteDesignPresentationPptx",
        "siteDesignPresentationPdf",
    ],
    "Presentation downloads must lead with the formal Insights deck",
)
require(not any("site-demo" in item["downloadName"] for item in files), "Legacy site-demo download names remain")

reflection_markdown = (ARTIFACTS / "reflection.md").read_text(encoding="utf-8")
reflection_words = re.findall(r"\b[\w'-]+\b", re.sub(r"<!--.*?-->|^#+\s+", "", reflection_markdown, flags=re.MULTILINE))
require(1100 <= len(reflection_words) <= 1300, f"Reflection word count is {len(reflection_words)}")
require(reflection_markdown.count("<!-- pagebreak -->") == 2, "Reflection must declare exactly three pages")

reflection_pdf = ARTIFACTS / "global-energy-atlas-reflection.pdf"
reflection_info = pdf_info(reflection_pdf)
require("Pages:           3" in reflection_info, "Reflection PDF must have three pages")
require("612 x 792 pts (letter)" in reflection_info.lower(), "Reflection PDF must use Letter pages")

method_pdf = ARTIFACTS / "global-energy-atlas-methodology.pdf"
method_info = pdf_info(method_pdf)
require("Pages:           1" in method_info, "Methodology PDF must have one page")
require("612 x 792 pts (letter)" in method_info.lower(), "Methodology PDF must use Letter pages")

method_docx_text = normalized(xml_text_from_zip(ARTIFACTS / "global-energy-atlas-methodology.docx", "word/"))
reflection_text = normalized(reflection_markdown + "\n" + pdf_text(reflection_pdf))
method_text = normalized(method_docx_text + "\n" + pdf_text(method_pdf))

insights_pptx = ARTIFACTS / "global-energy-atlas-insights-and-decision-use-presentation.pptx"
design_pptx = ARTIFACTS / "global-energy-atlas-site-design-presentation.pptx"
presentation_text, insight_slides, insight_notes = pptx_text_and_counts(insights_pptx)
design_text, design_slides, design_notes = pptx_text_and_counts(design_pptx)
require(insight_slides == 7, f"Insights presentation contains {insight_slides} slides")
require(insight_notes == 7, f"Insights presentation contains {insight_notes} note pages")
require(design_slides == 7, f"Site Design presentation contains {design_slides} slides")
require(design_notes == 7, f"Site Design presentation contains {design_notes} note pages")
timings = [int(value) for value in re.findall(r"time budget:\s*(\d+)\s*seconds", presentation_text)]
require(timings == [35, 40, 45, 45, 45, 50, 40], f"Insights presentation timings are {timings}")
design_timings = [int(value) for value in re.findall(r"time budget:\s*(\d+)\s*seconds", design_text)]
require(len(design_timings) == 7, f"Site Design timings are {design_timings}")
for heading in (
    "which markets deserve deeper energy diligence",
    "data scope and general observations",
    "price and generation contrasts",
    "consumption concentration",
    "energy balance positions",
    "decision use and diligence shortlist",
    "method, evidence boundaries, and limitations",
):
    require(heading in presentation_text, f"Insights presentation omits {heading}")
require("supplemental design walkthrough" in design_text, "Site Design cover is not identified as supplemental")
require("five-minute site demonstration" not in design_text, "Site Design deck still claims to be the formal demonstration")

for pdf_name in (
    "global-energy-atlas-insights-and-decision-use-presentation.pdf",
    "global-energy-atlas-site-design-presentation.pdf",
):
    require("Pages:           7" in pdf_info(ARTIFACTS / pdf_name), f"{pdf_name} must have seven pages")

readme_text = normalized((ROOT / "README.md").read_text(encoding="utf-8"))
site_text = normalized((ROOT / "src" / "i18n.ts").read_text(encoding="utf-8") + "\n" + (ROOT / "src" / "pages" / "AtlasPage.tsx").read_text(encoding="utf-8"))
for label, text in {
    "reflection": reflection_text,
    "methodology": method_text,
    "presentation": presentation_text,
    "website": site_text,
    "README": readme_text,
}.items():
    for level in EXPECTED_STATUSES:
        require(level in text, f"{label} omits {level} analysis")
    require("performed" in text and "partial" in text and "not performed" in text, f"{label} omits analysis statuses")
    for claim in CORE_LIMITS:
        require(claim in text, f"{label} omits core limit: {claim}")

require("method, evidence boundaries, and limitations" in presentation_text, "Insights slide seven title is missing")
require("evidence boundaries and deliverables" in design_text, "Site Design slide seven title is missing")
require("/deliverables" in presentation_text and "/deliverables" in readme_text, "Public Deliverables URL is missing")

print(json.dumps({
    "requirements": len(manifest["requirements"]),
    "downloads": len(files),
    "reflectionWords": len(reflection_words),
    "reflectionPages": 3,
    "methodologyPages": 1,
    "insightsSlides": insight_slides,
    "insightsNotes": insight_notes,
    "seconds": sum(timings),
    "siteDesignSlides": design_slides,
    "siteDesignNotes": design_notes,
}, indent=2))
