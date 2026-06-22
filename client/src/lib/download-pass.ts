import html2canvas from "html2canvas";

export async function downloadPassPng(element: HTMLElement, passId: string): Promise<void> {
  // FIX 1 + 2 — wait for fonts, then allow a full paint cycle before capture
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: null,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    // FIX 4 — copy all stylesheets into the cloned document so custom fonts render correctly
    onclone: (clonedDoc) => {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("\n");
          const style = clonedDoc.createElement("style");
          style.textContent = rules;
          clonedDoc.head.appendChild(style);
        } catch (_) {
          // cross-origin sheets — skip
        }
      });
    },
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      "image/png"
    );
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ACCESS-PASS-${passId}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
