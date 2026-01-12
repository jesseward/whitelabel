import { useState, useCallback } from 'react';
import type { AlbumArt } from '../types';
import piexif from 'piexifjs';
import Konva from 'konva';

interface UseMosaicExportProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  albums: AlbumArt[];
  enhancedImage?: string | null;
}

export const useMosaicExport = ({ stageRef, albums, enhancedImage }: UseMosaicExportProps) => {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality] = useState(0.9);

  const getCanvasBase64 = useCallback(() => {
    if (!stageRef.current) return '';
    return stageRef.current.toDataURL({ pixelRatio: 2 });
  }, [stageRef]);

  const handleExport = useCallback(() => {
    if (!stageRef.current && !enhancedImage) return;

    let dataURL = '';
    let exportFormat = format;

    if (enhancedImage) {
      dataURL = enhancedImage;
      // Detect format from data URL
      if (dataURL.startsWith('data:image/png')) {
        exportFormat = 'png';
      } else if (dataURL.startsWith('data:image/jpeg') || dataURL.startsWith('data:image/jpg')) {
        exportFormat = 'jpeg';
      }
    } else if (stageRef.current) {
      dataURL = stageRef.current.toDataURL({ 
        pixelRatio: 3, 
        mimeType: `image/${format}`,
        quality: format === 'jpeg' ? quality : undefined
      });
    }

    let finalDataURL = dataURL;

    // Only inject metadata for JPEG
    if (exportFormat === 'jpeg') {
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
    link.download = `whitelabel-${Date.now()}.${exportFormat}`;
    link.href = finalDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [stageRef, format, quality, albums, enhancedImage]);

  return {
    format,
    setFormat,
    handleExport,
    getCanvasBase64
  };
};
