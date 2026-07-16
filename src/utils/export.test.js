import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("html2canvas", () => ({ default: vi.fn() }));
vi.mock("jspdf", () => {
  const instances = [];
  class MockJsPDF {
    constructor() {
      instances.push(this);
      this.internal = {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
      };
      this.addPage = vi.fn();
      this.setFillColor = vi.fn();
      this.rect = vi.fn();
      this.addImage = vi.fn();
      this.save = vi.fn();
    }
  }
  MockJsPDF.instances = instances;
  return { jsPDF: MockJsPDF };
});

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  download,
  cleanClone,
  prepareClone,
  exportPNG,
  exportJPEG,
  exportPDF,
} from "./export.js";

function makeCanvas(width = 800, height = 400) {
  return {
    width,
    height,
    toDataURL: vi.fn((type) => `data:${type};base64,mock`),
  };
}

function mockDownloadLink() {
  const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
  vi.spyOn(document, "createElement").mockReturnValue(link);
  vi.spyOn(document.body, "appendChild").mockImplementation(() => {});
  return link;
}

describe("download", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a temporary link, clicks it, and removes it", () => {
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => {});

    download("blob:test", "test.pdf");

    expect(mockLink.href).toBe("blob:test");
    expect(mockLink.download).toBe("test.pdf");
    expect(mockLink.click).toHaveBeenCalled();
  });
});

describe("cleanClone", () => {
  it("strips gradient backgrounds", () => {
    const el = document.createElement("div");
    el.style.background = "linear-gradient(red, blue)";
    cleanClone(el);
    expect(el.style.background).toMatch(/none/);
  });

  it("strips filter properties", () => {
    const el = document.createElement("div");
    el.style.filter = "blur(5px)";
    cleanClone(el);
    expect(el.style.filter).toBe("none");
  });

  it("strips backdrop-filter", () => {
    const el = document.createElement("div");
    el.style.backdropFilter = "blur(10px)";
    cleanClone(el);
    expect(el.style.backdropFilter).toBe("none");
  });

  it("strips transform and animation", () => {
    const el = document.createElement("div");
    el.style.transform = "rotate(45deg)";
    el.style.animation = "fade 1s";
    cleanClone(el);
    expect(el.style.transform).toBe("none");
    expect(el.style.animation).toBe("none");
  });

  it("preserves non-gradient solid backgrounds", () => {
    const el = document.createElement("div");
    el.style.background = "rgb(255, 0, 0)";
    cleanClone(el);
    expect(el.style.background).toBe("rgb(255, 0, 0)");
  });
});

describe("prepareClone", () => {
  it("sets cv-content width to 210mm when element exists", () => {
    const doc = document.implementation.createHTMLDocument();
    const cv = doc.createElement("div");
    cv.id = "cv-content";
    doc.body.appendChild(cv);

    prepareClone(doc);

    expect(cv.style.width).toBe("210mm");
    expect(cv.style.maxWidth).toBe("210mm");
    expect(cv.style.overflow).toBe("visible");
  });

  it("does not throw when cv-content is missing", () => {
    const doc = document.implementation.createHTMLDocument();

    expect(() => prepareClone(doc)).not.toThrow();
  });

  it("calls cleanClone on the body", () => {
    const doc = document.implementation.createHTMLDocument();
    const child = doc.createElement("div");
    child.style.filter = "blur(5px)";
    doc.body.appendChild(child);

    prepareClone(doc);

    expect(child.style.filter).toBe("none");
  });
});

describe("exportPNG", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(html2canvas).mockReset();
  });

  it("captures the element and downloads a PNG", async () => {
    const canvas = makeCanvas();
    vi.mocked(html2canvas).mockImplementation(async (el, opts) => {
      opts.onclone(document.implementation.createHTMLDocument());
      return canvas;
    });
    const element = document.createElement("div");
    const link = mockDownloadLink();

    await exportPNG(element);

    expect(html2canvas).toHaveBeenCalledWith(
      element,
      expect.objectContaining({ scale: 2, backgroundColor: "#131318" }),
    );
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/png");
    expect(link.download).toBe("resume.png");
    expect(link.click).toHaveBeenCalled();
  });
});

describe("exportJPEG", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(html2canvas).mockReset();
  });

  it("captures the element and downloads a JPEG", async () => {
    const canvas = makeCanvas();
    vi.mocked(html2canvas).mockImplementation(async (el, opts) => {
      opts.onclone(document.implementation.createHTMLDocument());
      return canvas;
    });
    const element = document.createElement("div");
    const link = mockDownloadLink();

    await exportJPEG(element);

    expect(canvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.92);
    expect(link.download).toBe("resume.jpg");
    expect(link.click).toHaveBeenCalled();
  });
});

describe("exportPDF", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(html2canvas).mockReset();
    jsPDF.instances.length = 0;
  });

  function makeElement(blocks) {
    return {
      style: { boxShadow: "0 0 1px red" },
      querySelectorAll: vi.fn(() => blocks),
    };
  }

  it("skips hidden blocks and captures only visible ones", async () => {
    const visible = { offsetWidth: 100, offsetHeight: 50 };
    const hidden = { offsetWidth: 0, offsetHeight: 0 };
    vi.mocked(html2canvas).mockImplementation(async (el, opts) => {
      opts.onclone(document.implementation.createHTMLDocument());
      return makeCanvas();
    });
    const element = makeElement([visible, hidden]);

    await exportPDF(element);

    expect(html2canvas).toHaveBeenCalledTimes(1);
    expect(html2canvas).toHaveBeenCalledWith(visible, expect.any(Object));
  });

  it("composes blocks into an A4 PDF and saves it", async () => {
    const blocks = [
      { offsetWidth: 100, offsetHeight: 50 },
      { offsetWidth: 100, offsetHeight: 50 },
    ];
    vi.mocked(html2canvas).mockResolvedValue(makeCanvas());
    const element = makeElement(blocks);

    await exportPDF(element);

    const pdf = jsPDF.instances[0];
    expect(pdf.addImage).toHaveBeenCalledTimes(2);
    expect(pdf.addImage).toHaveBeenCalledWith(
      expect.stringContaining("image/jpeg"),
      "JPEG",
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
    expect(pdf.save).toHaveBeenCalledWith("resume.pdf");
    expect(element.style.boxShadow).toBe("");
  });

  it("adds a new page when a block does not fit", async () => {
    const blocks = [
      { offsetWidth: 100, offsetHeight: 50 },
      { offsetWidth: 100, offsetHeight: 50 },
      { offsetWidth: 100, offsetHeight: 50 },
    ];
    vi.mocked(html2canvas).mockResolvedValue(makeCanvas(800, 400));
    const element = makeElement(blocks);

    await exportPDF(element);

    const pdf = jsPDF.instances[0];
    expect(pdf.addPage).toHaveBeenCalledTimes(1);
    expect(pdf.rect).toHaveBeenCalledTimes(2);
    expect(pdf.setFillColor).toHaveBeenCalledWith(19, 19, 24);
  });

  it("paints the dark background on every page", async () => {
    vi.mocked(html2canvas).mockResolvedValue(makeCanvas());
    const element = makeElement([]);

    await exportPDF(element);

    const pdf = jsPDF.instances[0];
    expect(pdf.rect).toHaveBeenCalledWith(0, 0, 210, 297, "F");
    expect(pdf.save).toHaveBeenCalledWith("resume.pdf");
  });
});
