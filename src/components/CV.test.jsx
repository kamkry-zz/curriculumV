import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CV from "./CV.jsx";

const minimalData = {
  name: "Test User",
  title: "Engineer",
  skills: ["React", "Docker"],
  interests: ["Coding"],
};

afterEach(() => {
  cleanup();
});

function renderCV(props = {}) {
  return render(<CV data={minimalData} {...props} />);
}

describe("CV", () => {
  it("renders the name", () => {
    renderCV();
    expect(screen.getByText("Test User")).toBeTruthy();
  });

  it("renders the title", () => {
    renderCV();
    expect(screen.getByText("Engineer")).toBeTruthy();
  });

  it("renders skills as tags", () => {
    renderCV();
    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("Docker")).toBeTruthy();
  });

  it("renders interests", () => {
    renderCV();
    expect(screen.getByText("Coding")).toBeTruthy();
  });

  it("renders section titles", () => {
    renderCV();
    expect(screen.getByText("Skills")).toBeTruthy();
    expect(screen.getByText("Interests")).toBeTruthy();
  });

  it("does not render optional sections when data is missing", () => {
    renderCV();
    expect(screen.queryByText("Summary")).toBeNull();
    expect(screen.queryByText("Experience")).toBeNull();
    expect(screen.queryByText("Education")).toBeNull();
  });

  it("renders initials when no photo provided", () => {
    renderCV();
    expect(screen.getByText("TU")).toBeTruthy();
  });

  it("renders photo when provided", () => {
    renderCV({
      photo:
        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    });
    const photo = document.querySelector('[role="img"]');
    expect(photo).toBeTruthy();
  });
});
