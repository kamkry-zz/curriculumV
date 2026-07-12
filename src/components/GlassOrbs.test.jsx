import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GlassOrbs from "./GlassOrbs.jsx";

describe("GlassOrbs", () => {
  it("renders five orbs", () => {
    const { container } = render(<GlassOrbs />);
    const wrapper = container.firstChild;
    expect(wrapper.children).toHaveLength(5);
  });

  it("orbs have correct blur filters", () => {
    const { container } = render(<GlassOrbs />);
    const firstOrb = container.firstChild.firstChild;
    expect(firstOrb.style.filter).toContain("blur");
  });
});
