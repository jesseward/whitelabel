import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
  fetchImageBlobData,
  getProxiedUrl,
  resetProxyHosts,
} from "./imageProxy";

const ok = (type = "image/jpeg") => ({
  ok: true,
  blob: () => Promise.resolve(new Blob(["x"], { type })),
});

describe("fetchImageBlobData", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    resetProxyHosts();
  });

  it("uses the direct URL when it succeeds", async () => {
    (fetch as Mock).mockResolvedValue(ok());
    await fetchImageBlobData("https://a.example/1.jpg");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://a.example/1.jpg");
  });

  it("falls back to the proxy on a network/CORS failure and remembers the host", async () => {
    (fetch as Mock)
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(ok("image/webp"));

    await fetchImageBlobData("https://b.example/1.jpg");
    expect(fetch).toHaveBeenLastCalledWith(
      getProxiedUrl("https://b.example/1.jpg", "medium"),
    );

    (fetch as Mock).mockClear();
    await fetchImageBlobData("https://b.example/2.jpg");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      getProxiedUrl("https://b.example/2.jpg", "medium"),
    );
  });

  it("does not fall back on an HTTP error", async () => {
    (fetch as Mock).mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchImageBlobData("https://c.example/x.jpg")).rejects.toThrow(
      "404",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects non-image responses", async () => {
    (fetch as Mock).mockResolvedValue(ok("text/html"));
    await expect(fetchImageBlobData("https://d.example/x")).rejects.toThrow(
      "content type",
    );
  });
});
