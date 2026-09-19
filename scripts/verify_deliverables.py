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


summary = json.loads((ARTIFACTS / "analysis-summary.json").read_text(encoding="utf-8"))
statuses = {level: boundary["status"] for level, boundary in summary["evidenceBoundaries"].items()}
require(statuses == EXPECTED_STATUSES, f"Unexpected evidence boundary statuses: {statuses}")
for boundary in summary["evidenceBoundaries"].values():
    require(set(boundary) == {"status", "supports", "doesNotProve", "missingInputs", "nextWork"}, "Evidence boundary schema drift")

manifest = json.loads((ROOT / "data" / "deliverables.json").read_text(encoding="utf-8"))
files = [item for group in manifest["groups"] for item in group["files"]]
require(len(manifest["requirements"]) == 5, "The course checklist must contain five requirements")
require(len(files) == 9, "The public manifest must contain nine files")
require(len({item["downloadName"] for item in files}) == 9, "Download names must be unique")
for item in files:
    require((ROOT / item["sourcePath"]).is_file(), f"Missing deliverable: {item['sourcePath']}")

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

pptx = ARTIFACTS / "global-energy-atlas-site-demo.pptx"
with zipfile.ZipFile(pptx) as archive:
    slides = [name for name in archive.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)]
    notes = [name for name in archive.namelist() if re.fullmatch(r"ppt/notesSlides/notesSlide\d+\.xml", name)]
require(len(slides) == 7, f"Presentation contains {len(slides)} slides")
require(len(notes) == 7, f"Presentation contains {len(notes)} note pages")
presentation_text = normalized(xml_text_from_zip(pptx, "ppt/slides/") + "\n" + xml_text_from_zip(pptx, "ppt/notesSlides/"))
timings = [int(value) for value in re.findall(r"time budget:\s*(\d+)\s*seconds", presentation_text)]
require(len(timings) == 7 and sum(timings) == 300, f"Presentation timings are {timings}")

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

require("evidence boundaries and deliverables" in presentation_text, "Presentation slide seven title is missing")
require("/deliverables" in presentation_text and "/deliverables" in readme_text, "Public Deliverables URL is missing")

print(json.dumps({
    "requirements": len(manifest["requirements"]),
    "downloads": len(files),
    "reflectionWords": len(reflection_words),
    "reflectionPages": 3,
    "methodologyPages": 1,
    "slides": len(slides),
    "notes": len(notes),
    "seconds": sum(timings),
}, indent=2))
