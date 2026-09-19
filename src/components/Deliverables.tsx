import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { deliverableGroups } from "../deliverables";

async function downloadFile(
  event: MouseEvent<HTMLAnchorElement>,
  file: { url: string; downloadName: string },
) {
  event.preventDefault();
  const response = await fetch(file.url);
  if (!response.ok) throw new Error(`Download failed with ${response.status}`);
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.downloadName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export function Deliverables({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useTranslation();
  return (
    <section
      className="deliverables-section"
      id="deliverables"
      aria-labelledby="deliverables-title"
    >
      {showHeading && (
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("deliverables.eyebrow")}</p>
            <h2 id="deliverables-title">{t("deliverables.title")}</h2>
          </div>
          <p>{t("deliverables.intro")}</p>
        </div>
      )}
      <div className="deliverables-grid">
        {deliverableGroups.map((group, index) => (
          <article key={group.id}>
            <span className="deliverable-number">0{index + 1}</span>
            <h3>{t(`deliverables.${group.id}.title`)}</h3>
            <p>{t(`deliverables.${group.id}.description`)}</p>
            <div className="deliverable-links">
              {group.files.map((file) => (
                <div className="deliverable-file" key={file.id}>
                  <span>{file.label}</span>
                  <small>{file.format}</small>
                  <div>
                    {file.browserReadable && (
                      <a href={file.url} target="_blank" rel="noreferrer">
                        {t("deliverables.open")}
                      </a>
                    )}
                    <a
                      href={file.url}
                      download={file.downloadName}
                      data-deliverable-download={file.id}
                      onClick={(event) => void downloadFile(event, file)}
                    >
                      {t("deliverables.download")}
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
