import { describe, it, expect, vi } from "vitest";

vi.mock("./App.jsx", () => ({ default: () => <div>App</div> }));

describe("main", () => {
  it("renders without crashing", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    await expect(import("./main.jsx")).resolves.toBeDefined();
  });
});
