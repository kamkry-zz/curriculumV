import { describe, it, expect } from "vitest";
import { computeAlpha, drawSparkle } from "./Background.jsx";

describe("computeAlpha", () => {
  it("returns 0 at the very start", () => {
    expect(computeAlpha(0)).toBe(0);
  });

  it("ramps up to 1 during the fade-in phase", () => {
    expect(computeAlpha(0.1)).toBeCloseTo(0.5);
  });

  it("reaches 1 at the end of the fade-in", () => {
    expect(computeAlpha(0.2)).toBe(1);
  });

  it("stays at 1 during the hold phase", () => {
    expect(computeAlpha(0.3)).toBe(1);
    expect(computeAlpha(0.4)).toBe(1);
  });

  it("fades out after the hold phase", () => {
    expect(computeAlpha(0.55)).toBeCloseTo(0.9);
  });

  it("reaches 0 at the very end", () => {
    expect(computeAlpha(1)).toBe(0);
  });

  it("returns 0 after the lifetime", () => {
    expect(computeAlpha(1.2)).toBeLessThan(0);
  });
});

describe("drawSparkle", () => {
  it("calls expected canvas methods", () => {
    const calls = [];
    const ctx = {
      save: () => calls.push("save"),
      translate: () => calls.push("translate"),
      rotate: () => calls.push("rotate"),
      beginPath: () => calls.push("beginPath"),
      moveTo: () => calls.push("moveTo"),
      lineTo: () => calls.push("lineTo"),
      closePath: () => calls.push("closePath"),
      fill: () => calls.push("fill"),
      restore: () => calls.push("restore"),
    };

    drawSparkle(ctx, 100, 200, 10, 0);

    expect(calls[0]).toBe("save");
    expect(calls.at(-1)).toBe("restore");
    expect(calls).toContain("beginPath");
    expect(calls).toContain("fill");
  });

  it("does not throw for any rotation value", () => {
    const ctx = {
      save: () => {},
      translate: () => {},
      rotate: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      fill: () => {},
      restore: () => {},
    };

    expect(() => drawSparkle(ctx, 0, 0, 5, Math.PI)).not.toThrow();
  });
});
