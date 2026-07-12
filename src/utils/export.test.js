import { describe, it, expect, vi, afterEach } from "vitest";
import { download, cleanClone } from "./export.js";

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
