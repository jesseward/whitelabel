import { useState, useCallback } from 'react';
import type { AlbumArt } from '../types';
import piexif from 'piexifjs';
import Konva from 'konva';

interface UseMosaicExportProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  albums: AlbumArt[];
}

export const useMosaicExport = ({ stageRef, albums }: UseMosaicExportProps) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality] = useState(0.9);

  const getCanvasBase64 = useCallback(() => {
    if (!stageRef.current) return '';
    return stageRef.current.toDataURL({ pixelRatio: 2 });
  }, [stageRef]);

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({ 
      pixelRatio: 3, 
      mimeType: `image/${format}`,
      quality: format === 'jpeg' ? quality : undefined
    });

    let finalDataURL = dataURL;

    if (format === 'jpeg') {
      try {
        const metadataString = albums.map(a => `${a.artist} - ${a.album}`).join(', ');
        const zeroth: Record<number, string> = {};
        const exif: Record<number, string> = {};
        const gps: Record<number, string> = {};
        
        zeroth[piexif.ImageIFD.Software] = "WhiteLabel Album Art Creator";
        exif[piexif.ExifIFD.UserComment] = metadataString;
        
        const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
        const exifBytes = piexif.dump(exifObj);
        
        finalDataURL = piexif.insert(exifBytes, dataURL);
      } catch (err) {
        console.error('Failed to inject metadata:', err);
      }
    }

    const link = document.createElement('a');
    link.download = `whitelabel-${Date.now()}.${format}`;
    link.href = finalDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stageRef, format, quality, albums]);

  return {
    format,
    setFormat,
    handleExport,
    getCanvasBase64
  };
};
