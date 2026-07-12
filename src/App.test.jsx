import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("./components/CV", () => ({ default: () => <div>CV Mock</div> }));
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
});
