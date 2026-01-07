/**
 * Centralized utility for image proxying and optimization.
 * Uses wsrv.nl to bypass CORS and provide resized, optimized images.
 */

export type ImageSize = 'thumb' | 'medium' | 'large' | 'original';

const SIZE_MAP: Record<ImageSize, number> = {
  thumb: 300,
  medium: 600,
  large: 1200,
  original: 0
};

export const getProxiedUrl = (url: string, size: ImageSize = 'medium'): string => {
  if (!url) return '';
  
  const width = SIZE_MAP[size];
  const params = new URLSearchParams({
    url: url,
    ...(width > 0 && { w: width.toString(), h: width.toString(), fit: 'cover' }),
    output: 'webp',
    we: '1' // WebP fallback
  });

  return `https://wsrv.nl/?${params.toString()}`;
};
