import deliverableManifest from "../data/deliverables.json";
import assignmentCsv from "../data/energy-data.csv?url";
import expandedCsv from "../data/expanded-energy-50-v1.csv?url";
import sourceManifest from "../data/expanded-energy-50-v1.sources.json?url&no-inline";
import methodologyPdf from "../artifacts/global-energy-atlas-methodology.pdf?url";
import methodologyDocx from "../artifacts/global-energy-atlas-methodology.docx?url";
import insightsPresentationPptx from "../artifacts/global-energy-atlas-insights-and-decision-use-presentation.pptx?url";
import insightsPresentationPdf from "../artifacts/global-energy-atlas-insights-and-decision-use-presentation.pdf?url";
import siteDesignPresentationPptx from "../artifacts/global-energy-atlas-site-design-presentation.pptx?url";
import siteDesignPresentationPdf from "../artifacts/global-energy-atlas-site-design-presentation.pdf?url";
import reflectionPdf from "../artifacts/global-energy-atlas-reflection.pdf?url";
import reflectionMarkdown from "../artifacts/reflection.md?url";

const urls = {
  assignmentCsv,
  expandedCsv,
  sourceManifest,
  methodologyPdf,
  methodologyDocx,
  insightsPresentationPptx,
  insightsPresentationPdf,
  siteDesignPresentationPptx,
  siteDesignPresentationPdf,
  reflectionPdf,
  reflectionMarkdown,
} as const;

export type DeliverableId = keyof typeof urls;

export const courseRequirements = deliverableManifest.requirements;
export const deliverableGroups = deliverableManifest.groups.map((group) => ({
  ...group,
  files: group.files.map((file) => ({
    ...file,
    url: urls[file.id as DeliverableId],
  })),
}));

export const deliverableFiles = deliverableGroups.flatMap((group) => group.files);
