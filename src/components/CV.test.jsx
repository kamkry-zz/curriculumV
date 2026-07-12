import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CV from "./CV.jsx";

const minimalData = {
  name: "Test User",
  title: "Engineer",
  skills: ["React", "Docker"],
  interests: ["Coding"],
};

afterEach(() => cleanup());

function renderCV(props = {}) {
  return render(<CV data={minimalData} {...props} />);
}

const presenceCases = [
  ["name", "Test User"],
  ["title", "Engineer"],
  ["Skills section", "Skills"],
  ["Interests section", "Interests"],
  ["skill React", "React"],
  ["skill Docker", "Docker"],
  ["interest Coding", "Coding"],
  ["initials", "TU"],
];

describe("CV", () => {
  it.each(presenceCases)("renders %s", (_, text) => {
    renderCV();
    expect(screen.getByText(text)).toBeTruthy();
  });

  it("does not render optional sections when data is missing", () => {
    renderCV();
    expect(screen.queryByText("Summary")).toBeNull();
    expect(screen.queryByText("Experience")).toBeNull();
    expect(screen.queryByText("Education")).toBeNull();
  });

  it("renders photo when provided", () => {
    renderCV({
      photo:
        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
    });
    expect(document.querySelector('[role="img"]')).toBeTruthy();
  });
});
