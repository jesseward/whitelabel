import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./imageProxy", () => ({
  fetchImageBlobData: vi.fn(),
  needsProxy: vi.fn(),
}));

import { fetchImageBlobData, needsProxy } from "./imageProxy";
import { upgradeNodesForExport, type ImageNode } from "./hiResExport";

const makeNode = (initial: string) => {
  let current: unknown = initial;
  return {
    image: (img?: unknown) => {
      if (img === undefined) return current;
      current = img;
    },
    get: () => current,
  } as unknown as ImageNode & { get: () => unknown };
};

const album = (id: string) => ({
  id,
  url: `https://x.example/${id}.jpg`,
  artist: "A",
  album: id,
  provider: "itunes" as const,
});

describe("upgradeNodesForExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom does not decode images; resolve as soon as src is set.
    vi.stubGlobal(
      "Image",
      class {
        onload: (() => void) | null = null;
        set src(_: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:x"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("only upgrades proxied tiles and restores originals", async () => {
    vi.mocked(needsProxy).mockImplementation((u: string) => u.includes("/b."));
    vi.mocked(fetchImageBlobData).mockResolvedValue(new Blob());
    const a = makeNode("a0");
    const b = makeNode("b0");

    const restore = await upgradeNodesForExport(
      [a, b],
      [album("a"), album("b")],
    );

    expect(fetchImageBlobData).toHaveBeenCalledTimes(1);
    expect(fetchImageBlobData).toHaveBeenCalledWith(
      "https://x.example/b.jpg",
      "large",
    );
    expect(a.get()).toBe("a0");
    expect(b.get()).not.toBe("b0");

    restore();
    expect(b.get()).toBe("b0");
  });

  it("keeps the cached image when the upgrade fails", async () => {
    vi.mocked(needsProxy).mockReturnValue(true);
    vi.mocked(fetchImageBlobData).mockRejectedValue(new Error("boom"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = makeNode("a0");

    const restore = await upgradeNodesForExport([a], [album("a")]);
    expect(a.get()).toBe("a0");
    restore();
    expect(a.get()).toBe("a0");
  });

  it("does nothing when node and album counts differ", async () => {
    const restore = await upgradeNodesForExport([makeNode("a0")], []);
    expect(fetchImageBlobData).not.toHaveBeenCalled();
    restore();
  });
});
