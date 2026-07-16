import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("gsap", () => ({
  default: {
    quickTo: vi.fn(() => vi.fn()),
    to: vi.fn(),
  },
}));

import gsap from "gsap";
import CV from "./CV.jsx";

const minimalData = {
  name: "Test User",
  title: "Engineer",
  skills: ["React", "Docker"],
  interests: ["Coding"],
};

const fullData = {
  ...minimalData,
  email: "test@example.com",
  phone: "+48 123 456 789",
  location: "Warsaw, PL",
  website: "example.com",
  github: "https://github.com/test",
  linkedin: "https://linkedin.com/in/test",
  patents: "https://patents.example.com",
  summary: "Seasoned engineer.",
  experience: [
    {
      title: "DevOps Engineer",
      company: "Acme",
      start: "2020",
      end: "2024",
      location: "Remote",
      highlights: ["Built CI/CD", "Ran Kubernetes"],
    },
  ],
  education: [{ degree: "MSc", school: "Tech University", year: "2019" }],
  languages: [{ language: "English", level: "C1" }],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

describe("CV with full data", () => {
  it("renders all optional sections", () => {
    render(<CV data={fullData} />);
    expect(screen.getByText("Summary")).toBeTruthy();
    expect(screen.getByText("Experience")).toBeTruthy();
    expect(screen.getByText("Education")).toBeTruthy();
    expect(screen.getByText("Languages")).toBeTruthy();
    expect(screen.getByText("Seasoned engineer.")).toBeTruthy();
  });

  it("renders experience details with highlights", () => {
    render(<CV data={fullData} />);
    expect(screen.getByText("DevOps Engineer")).toBeTruthy();
    expect(screen.getByText("at Acme")).toBeTruthy();
    expect(screen.getByText("2020 — 2024")).toBeTruthy();
    expect(screen.getByText("Remote")).toBeTruthy();
    expect(screen.getByText("Built CI/CD")).toBeTruthy();
    expect(screen.getByText("Ran Kubernetes")).toBeTruthy();
  });

  it("renders education and languages", () => {
    render(<CV data={fullData} />);
    expect(screen.getByText("MSc")).toBeTruthy();
    expect(screen.getByText("— Tech University")).toBeTruthy();
    expect(screen.getByText("2019")).toBeTruthy();
    expect(screen.getByText("English")).toBeTruthy();
  });

  it("renders contact links with correct hrefs", () => {
    render(<CV data={fullData} />);
    expect(screen.getByText("test@example.com").href).toBe(
      "mailto:test@example.com",
    );
    expect(screen.getByText("example.com").href).toBe("https://example.com/");
    expect(screen.getByText("https://github.com/test").href).toBe(
      "https://github.com/test",
    );
    expect(screen.getByText("https://linkedin.com/in/test").href).toBe(
      "https://linkedin.com/in/test",
    );
    expect(screen.getByText("Patents (EPO)").href).toBe(
      "https://patents.example.com/",
    );
    expect(screen.getByText("+48 123 456 789")).toBeTruthy();
    expect(screen.getByText("Warsaw, PL")).toBeTruthy();
  });

  it("underlines links on hover and restores them on leave", () => {
    render(<CV data={fullData} />);
    const links = [
      screen.getByText("test@example.com"),
      screen.getByText("example.com"),
      screen.getByText("https://github.com/test"),
      screen.getByText("https://linkedin.com/in/test"),
      screen.getByText("Patents (EPO)"),
    ];

    for (const link of links) {
      fireEvent.mouseEnter(link);
      expect(link.style.textDecoration).toBe("underline");
      expect(link.style.color).toBe("rgb(196, 181, 253)");

      fireEvent.mouseLeave(link);
      expect(link.style.textDecoration).toBe("none");
      expect(link.style.color).toBe("rgb(167, 139, 250)");
    }
  });
});

describe("CV animations", () => {
  const rect = {
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
  };

  it("sets up gsap tilt and reacts to mouse movement", () => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(rect);
    const { container } = render(<CV data={minimalData} />);
    const card = container.querySelector("#cv-content");

    expect(gsap.quickTo).toHaveBeenCalled();

    fireEvent.mouseMove(card, { clientX: 150, clientY: 25 });
    fireEvent.mouseLeave(card);

    expect(gsap.to).toHaveBeenCalledWith(
      card,
      expect.objectContaining({ rotateX: 0, rotateY: 0 }),
    );
  });

  it("applies magnetic hover to the name", () => {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(rect);
    render(<CV data={minimalData} />);
    const name = screen.getByText("Test User");

    fireEvent.mouseMove(name, { clientX: 50, clientY: 50 });
    fireEvent.mouseLeave(name);

    expect(gsap.to).toHaveBeenCalledWith(
      name,
      expect.objectContaining({ x: 0, y: 0 }),
    );
  });

  it("skips gsap setup when prefers-reduced-motion is set", () => {
    const original = globalThis.matchMedia;
    globalThis.matchMedia = (query) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    gsap.quickTo.mockClear();

    render(<CV data={minimalData} />);

    expect(gsap.quickTo).not.toHaveBeenCalled();
    globalThis.matchMedia = original;
  });
});
