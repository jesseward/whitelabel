import { fetchImageBlobData, needsProxy } from "./imageProxy";
import type { AlbumArt } from "../types";

/** The slice of a Konva.Image node that we need. */
export interface ImageNode {
  image(): CanvasImageSource | undefined;
  image(img: CanvasImageSource): unknown;
}

const loadImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image decode failed"));
    };
    img.src = objectUrl;
  });

/**
 * Cached tiles are 600px when they came through the proxy, which looks soft at
 * the export pixel ratio. Swap in 1200px versions for those tiles and return a
 * function that restores the originals. Direct fetches are already full size,
 * and any tile that fails to upgrade keeps its cached image.
 */
export const upgradeNodesForExport = async (
  nodes: ImageNode[],
  albums: AlbumArt[],
): Promise<() => void> => {
  const originals: [ImageNode, CanvasImageSource | undefined][] = [];
  if (nodes.length === albums.length) {
    await Promise.all(
      nodes.map(async (node, i) => {
        if (!needsProxy(albums[i].url)) return;
        try {
          const blob = await fetchImageBlobData(albums[i].url, "large");
          const img = await loadImage(blob);
          originals.push([node, node.image()]);
          node.image(img);
        } catch (error) {
          console.warn(`Using cached image for ${albums[i].url}:`, error);
        }
      }),
    );
  }
  return () => {
    originals.forEach(([node, img]) => {
      if (img) node.image(img);
    });
  };
};
