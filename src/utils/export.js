import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export function download(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const CAPTURE_OPTS = {
  scale: 2,
  useCORS: true,
  backgroundColor: "#131318",
  allowTaint: false,
};

function prepareClone(clonedDoc) {
  cleanClone(clonedDoc.body);
  const cv = clonedDoc.getElementById("cv-content");
  if (cv) {
    cv.style.width = "210mm";
    cv.style.maxWidth = "210mm";
    cv.style.overflow = "visible";
  }
}

export function cleanClone(el) {
  el.style.setProperty("filter", "none", "important");
  el.style.setProperty("backdrop-filter", "none", "important");
  el.style.setProperty("-webkit-backdrop-filter", "none", "important");
  el.style.setProperty("transform", "none", "important");
  el.style.setProperty("animation", "none", "important");
  el.style.setProperty("transition", "none", "important");
  el.style.setProperty("background-clip", "border-box", "important");
  el.style.setProperty("-webkit-background-clip", "border-box", "important");
  el.style.setProperty("-webkit-text-fill-color", "currentColor", "important");
  el.style.setProperty("box-shadow", "none", "important");
  el.style.setProperty("perspective", "none", "important");

  const bg = el.style.background || el.style.backgroundImage || "";
  if (bg.includes("gradient")) {
    el.style.setProperty("background", "none", "important");
    el.style.setProperty("background-image", "none", "important");
  }

  el.querySelectorAll("*").forEach((child) => cleanClone(child));
}

async function captureBlock(el) {
  return html2canvas(el, {
    ...CAPTURE_OPTS,
    onclone(clonedDoc) {
      prepareClone(clonedDoc);
    },
  });
}

export async function exportPNG(element) {
  const canvas = await html2canvas(element, {
    ...CAPTURE_OPTS,
    onclone(clonedDoc) {
      prepareClone(clonedDoc);
    },
  });
  download(canvas.toDataURL("image/png"), "resume.png");
}

export async function exportJPEG(element) {
  const canvas = await html2canvas(element, {
    ...CAPTURE_OPTS,
    onclone(clonedDoc) {
      prepareClone(clonedDoc);
    },
  });
  download(canvas.toDataURL("image/jpeg", 0.92), "resume.jpg");
}

export async function exportPDF(element) {
  element.style.boxShadow = "none";

  const blocks = Array.from(
    element.querySelectorAll("[data-export-block]")
  ).filter((b) => b.offsetWidth > 0 && b.offsetHeight > 0);

  const canvases = [];
  for (const block of blocks) {
    canvases.push(await captureBlock(block));
  }

  element.style.boxShadow = "";

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;
  const gap = 1;

  let pageNum = 0;

  function newPage() {
    if (pageNum > 0) pdf.addPage();
    pageNum++;
    pdf.setFillColor(19, 19, 24);
    pdf.rect(0, 0, pageW, pageH, "F");
    return margin;
  }

  let y = newPage();

  for (const canvas of canvases) {
    const blockH = (canvas.height / canvas.width) * contentW;

    if (y + blockH > pageH - margin) {
      y = newPage();
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(imgData, "JPEG", margin, y, contentW, blockH);
    y += blockH + gap;
  }

  pdf.save("resume.pdf");
}
