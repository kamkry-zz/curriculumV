import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import Background, {
  computeAlpha,
  drawSparkle,
  drawParticles,
  drawSparkleShapes,
  drawStatic,
} from "./Background.jsx";

function makeCtx() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    closePath: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    globalAlpha: 1,
    shadowColor: "",
    shadowBlur: 0,
  };
}

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

describe("drawParticles", () => {
  const makeParticle = (overrides = {}) => ({
    x: 50,
    y: 50,
    vx: 1,
    vy: 1,
    r: 2,
    color: "red",
    ...overrides,
  });

  it("moves particles by their velocity and draws them", () => {
    const ctx = makeCtx();
    const p = makeParticle();

    drawParticles(ctx, [p], 100, 100);

    expect(p.x).toBe(51);
    expect(p.y).toBe(51);
    expect(ctx.arc).toHaveBeenCalledWith(51, 51, 2, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("wraps particles around the left/top edges", () => {
    const ctx = makeCtx();
    const p = makeParticle({ x: 0, y: 0, vx: -1, vy: -1 });

    drawParticles(ctx, [p], 100, 100);

    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });

  it("wraps particles around the right/bottom edges", () => {
    const ctx = makeCtx();
    const p = makeParticle({ x: 100, y: 100, vx: 1, vy: 1 });

    drawParticles(ctx, [p], 100, 100);

    expect(p.x).toBe(0);
    expect(p.y).toBe(0);
  });

  it("draws connection lines between close particles", () => {
    const ctx = makeCtx();
    const a = makeParticle({ x: 10, y: 10, vx: 0, vy: 0 });
    const b = makeParticle({ x: 20, y: 10, vx: 0, vy: 0 });

    drawParticles(ctx, [a, b], 100, 100);

    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledWith(10, 10);
    expect(ctx.lineTo).toHaveBeenCalledWith(20, 10);
  });

  it("does not connect particles farther than the connection distance", () => {
    const ctx = makeCtx();
    const a = makeParticle({ x: 0, y: 0, vx: 0, vy: 0 });
    const b = makeParticle({ x: 500, y: 500, vx: 0, vy: 0 });

    drawParticles(ctx, [a, b], 1000, 1000);

    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});

describe("drawSparkleShapes", () => {
  it("draws a glow and sparkle for each entry and resets alpha", () => {
    const ctx = makeCtx();
    const sparkles = [
      { x: 10, y: 20, r: 8, color: "#FFD700", born: 0, rotation: 0 },
      { x: 30, y: 40, r: 6, color: "#00FFFF", born: 100, rotation: 1 },
    ];

    drawSparkleShapes(ctx, sparkles, 800);

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(2);
    expect(ctx.save).toHaveBeenCalledTimes(2);
    expect(ctx.restore).toHaveBeenCalledTimes(2);
    expect(ctx.globalAlpha).toBe(1);
  });

  it("scales the sparkle up during the pop-in phase", () => {
    const ctx = makeCtx();
    const sparkle = { x: 0, y: 0, r: 10, color: "#FF00FF", born: 0, rotation: 0 };

    expect(() => drawSparkleShapes(ctx, [sparkle], 100)).not.toThrow();
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe("drawStatic", () => {
  it("clears the canvas and draws every particle without moving it", () => {
    const ctx = makeCtx();
    const particles = [
      { x: 5, y: 6, r: 2, color: "red" },
      { x: 7, y: 8, r: 3, color: "blue" },
    ];

    drawStatic(ctx, particles, 100, 100);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(particles[0].x).toBe(5);
  });
});

describe("Background component", () => {
  let rafCallbacks;

  function setup({ reducedMotion = false } = {}) {
    rafCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("matchMedia", (query) => ({
      matches: reducedMotion,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const ctx = makeCtx();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);
    return ctx;
  }

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders a fixed canvas", () => {
    setup();
    const { container } = render(<Background />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(canvas.className).toContain("pointer-events-none");
  });

  it("starts the animation loop and draws particles", () => {
    const ctx = setup();
    render(<Background />);

    expect(rafCallbacks.length).toBe(1);
    rafCallbacks[0](16);

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(rafCallbacks.length).toBe(2);
  });

  it("spawns sparkles once the interval has elapsed", () => {
    const ctx = setup();
    render(<Background />);

    rafCallbacks[0](10_000);

    expect(ctx.createRadialGradient).toHaveBeenCalled();
  });

  it("draws a static frame when prefers-reduced-motion is set", () => {
    const ctx = setup({ reducedMotion: true });
    render(<Background />);

    expect(rafCallbacks.length).toBe(1);
    rafCallbacks[0](16);

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(rafCallbacks.length).toBe(1);
  });

  it("cancels the animation frame on unmount", () => {
    setup();
    const { unmount } = render(<Background />);
    unmount();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
});
