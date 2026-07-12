import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import Footer from "./Footer.jsx";

afterEach(() => cleanup());

describe("Footer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the GitHub source link", () => {
    render(<Footer />);
    const link = screen.getByText("Star on GitHub").closest("a");
    expect(link).toBeTruthy();
    expect(link.href).toBe("https://github.com/kamkry-zz/curriculumV");
    expect(link.target).toBe("_blank");
    expect(link.rel).toBe("noopener noreferrer");
  });

  it("renders the version tag", () => {
    render(<Footer />);
    expect(screen.getByText("v1.0.2")).toBeTruthy();
  });

  it("renders the docker run command with the image tag", () => {
    render(<Footer />);
    expect(
      screen.getByText(
        "docker run -p 8080:8080 ghcr.io/kamkry-zz/curriculumv:1.0.2",
      ),
    ).toBeTruthy();
  });

  it('shows "Copy" button by default', () => {
    render(<Footer />);
    expect(screen.getByText("Copy")).toBeTruthy();
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it('copies to clipboard and shows "Copied" on click', async () => {
    render(<Footer />);
    const button = screen.getByText("Copy").closest("button");
    await act(async () => {
      fireEvent.click(button);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "docker run -p 8080:8080 ghcr.io/kamkry-zz/curriculumv:1.0.2",
    );
    expect(screen.getByText("Copied")).toBeTruthy();
    expect(screen.queryByText("Copy")).toBeNull();
  });

  it('reverts to "Copy" after the timeout', async () => {
    render(<Footer />);
    const button = screen.getByText("Copy").closest("button");
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.getByText("Copied")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Copy")).toBeTruthy();
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("stays on Copy when clipboard API fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("denied"));

    render(<Footer />);
    const button = screen.getByText("Copy").closest("button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText("Copy")).toBeTruthy();
    expect(screen.queryByText("Copied")).toBeNull();

    consoleSpy.mockRestore();
  });
});
