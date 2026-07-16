import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

const cvState = vi.hoisted(() => ({ attachRef: true }));

vi.mock("./components/CV", () => ({
  default: ({ ref }) => <div ref={cvState.attachRef ? ref : null}>CV Mock</div>,
}));
vi.mock("./components/Background", () => ({ default: () => null }));
vi.mock("./components/GlassOrbs", () => ({ default: () => null }));
vi.mock("./utils/export", () => ({
  exportPDF: vi.fn(),
  exportPNG: vi.fn(),
  exportJPEG: vi.fn(),
}));
vi.mock("js-yaml", () => ({
  load: () => ({ name: "Test", title: "Engineer", email: "test@test.com" }),
}));
vi.mock("./data/resume.yaml?raw", () => ({ default: "" }));
vi.mock("./data/me.jpg", () => ({ default: "" }));

import App from "./App.jsx";
import { exportPDF, exportPNG, exportJPEG } from "./utils/export";

beforeEach(() => {
  cvState.attachRef = true;
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe("App", () => {
  it("renders the toolbar title", () => {
    render(<App />);
    expect(screen.getByText("Curriculum Vitae")).toBeTruthy();
  });

  it("renders export buttons", () => {
    render(<App />);
    expect(screen.getByText("Export PDF")).toBeTruthy();
    expect(screen.getByText("Export PNG")).toBeTruthy();
    expect(screen.getByText("Export JPEG")).toBeTruthy();
  });

  it("shows error when CV element ref is not available", async () => {
    cvState.attachRef = false;
    render(<App />);
    const pdfButton = screen.getByText("Export PDF").closest("button");
    await act(async () => {
      fireEvent.click(pdfButton);
    });
    expect(
      screen.getByText("CV element not found — report this bug"),
    ).toBeTruthy();
  });

  it.each([
    ["Export PDF", exportPDF],
    ["Export PNG", exportPNG],
    ["Export JPEG", exportJPEG],
  ])("clicking %s calls the matching export function", async (label, fn) => {
    fn.mockResolvedValue(undefined);
    render(<App />);
    const button = screen.getByText(label).closest("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].textContent).toBe("CV Mock");
  });

  it("shows the loading overlay while exporting and hides it after", async () => {
    let resolveExport;
    exportPDF.mockImplementation(
      () => new Promise((resolve) => (resolveExport = resolve)),
    );
    render(<App />);
    const button = screen.getByText("Export PDF").closest("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText("Generating PDF…")).toBeTruthy();
    expect(screen.getByText("Exporting…")).toBeTruthy();
    expect(screen.getByText("Export PNG").closest("button").disabled).toBe(
      true,
    );

    await act(async () => {
      resolveExport();
    });

    expect(screen.queryByText("Generating PDF…")).toBeNull();
    expect(screen.getByText("Export PDF")).toBeTruthy();
  });

  it("shows an error message when export fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exportPDF.mockRejectedValue(new Error("canvas blew up"));
    render(<App />);
    const button = screen.getByText("Export PDF").closest("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText("canvas blew up")).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("falls back to a generic error message when the error has no message", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exportPDF.mockRejectedValue(new Error(""));
    render(<App />);
    const button = screen.getByText("Export PDF").closest("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText("Export failed")).toBeTruthy();
    consoleSpy.mockRestore();
  });

  it("clears a previous error on the next export attempt", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exportPDF.mockRejectedValue(new Error("first failure"));
    exportPNG.mockResolvedValue(undefined);
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByText("Export PDF").closest("button"));
    });
    expect(screen.getByText("first failure")).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByText("Export PNG").closest("button"));
    });
    expect(screen.queryByText("first failure")).toBeNull();
    consoleSpy.mockRestore();
  });
});
