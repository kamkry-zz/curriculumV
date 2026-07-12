import { describe, it, expect, vi, afterEach } from "vitest";
import { download, cleanClone, prepareClone } from "./export.js";

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
