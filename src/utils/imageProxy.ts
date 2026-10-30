/**
 * Centralized utility for image proxying and optimization.
 * Uses wsrv.nl to bypass CORS and provide resized, optimized images.
 */

export type ImageSize = "thumb" | "medium" | "large" | "original";

const SIZE_MAP: Record<ImageSize, number> = {
  thumb: 300,
  medium: 600,
  large: 1200,
  original: 0,
};

export const getProxiedUrl = (
  url: string,
  size: ImageSize = "medium",
): string => {
  if (!url) return "";

  const width = SIZE_MAP[size];
  const params = new URLSearchParams({
    url: url,
    ...(width > 0 && {
      w: width.toString(),
      h: width.toString(),
      fit: "cover",
    }),
    output: "webp",
    we: "1", // WebP fallback
  });

  return `https://wsrv.nl/?${params.toString()}`;
};

// Hosts whose direct (CORS) fetch failed at the network level; go straight
// to the proxy for these so each host only pays for the failure once.
const proxyOnlyHosts = new Set<string>();

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const fetchImage = async (requestUrl: string): Promise<Blob> => {
  const res = await fetch(requestUrl);
  if (!res.ok) {
    throw new Error(`Image request failed with status ${res.status}`);
  }
  const blob = await res.blob();
  if (blob.type && !blob.type.startsWith("image/")) {
    throw new Error(`Unexpected content type ${blob.type}`);
  }
  return blob;
};

/**
 * Fetches an image as a Blob. Tries the original URL first (iTunes, Cover Art
 * Archive etc. usually send CORS headers) and falls back to the wsrv.nl proxy
 * when the direct request is blocked. HTTP errors do not trigger the fallback.
 * Direct fetches return the source resolution regardless of `size`.
 */
export const fetchImageBlobData = async (
  url: string,
  size: ImageSize = "medium",
): Promise<Blob> => {
  const host = hostOf(url);
  if (!proxyOnlyHosts.has(host)) {
    try {
      return await fetchImage(url);
    } catch (error) {
      // fetch rejects with TypeError for network/CORS failures.
      if (!(error instanceof TypeError)) throw error;
      proxyOnlyHosts.add(host);
    }
  }
  return fetchImage(getProxiedUrl(url, size));
};

/** Test helper: forget which hosts need the proxy. */
export const resetProxyHosts = (): void => proxyOnlyHosts.clear();
