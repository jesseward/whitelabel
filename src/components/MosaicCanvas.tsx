import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import type { AlbumArt } from '../types';
import useImage from 'use-image';
import piexif from 'piexifjs';
import { AIPanel } from './AIPanel';
import Konva from 'konva';

interface MosaicCanvasProps {
  albums: AlbumArt[];
  columns?: number;
  gap?: number;
  padding?: number;
  backgroundColor?: string;
}

const AlbumImage = ({ album, x, y, size }: { album: AlbumArt; x: number; y: number; size: number }) => {
  const [image] = useImage(album.localUrl || album.url, 'anonymous');
  
  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={size}
      height={size}
      cornerRadius={2}
    />
  );
};

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({
  albums,
  columns: initialColumns = 3,
  gap: initialGap = 10,
  padding: initialPadding = 20,
  backgroundColor: initialBgColor = '#0a0a0a',
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState(800);
  const [columns, setColumns] = useState(initialColumns);
  const [gap, setGap] = useState(initialGap);
  const [padding, setPadding] = useState(initialPadding);
  const [bgColor] = useState(initialBgColor);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality] = useState(0.9);
  
  // AI Enhanced Image State
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  // Responsive stage sizing
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 40, 800);
      setStageSize(width);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate dimensions
  const rows = Math.ceil(albums.length / columns);
  const containerWidth = stageSize;
  const availableWidth = containerWidth - (padding * 2) - (gap * (columns - 1));
  const cellSize = availableWidth / columns;
  const containerHeight = (rows * cellSize) + (gap * (rows - 1)) + (padding * 2);

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
  }, [format, quality, albums]);

  const getCanvasBase64 = useCallback(() => {
    if (!stageRef.current) return '';
    return stageRef.current.toDataURL({ pixelRatio: 2 });
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl items-start">
      <div className="flex-1 flex flex-col items-center gap-6 w-full">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full overflow-hidden flex justify-center relative">
          
          <Stage
            width={containerWidth}
            height={containerHeight}
            ref={stageRef}
            className={`rounded-lg overflow-hidden shadow-inner ${enhancedImage ? 'hidden' : 'block'}`}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={containerWidth}
                height={containerHeight}
                fill={bgColor}
              />
              {albums.map((album, index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);
                const x = padding + (col * (cellSize + gap));
                const y = padding + (row * (cellSize + gap));

                return (
                  <AlbumImage
                    key={album.id}
                    album={album}
                    x={x}
                    y={y}
                    size={cellSize}
                  />
                );
              })}
            </Layer>
          </Stage>

          {/* AI Result Overlay */}
          {enhancedImage && (
            <div className="relative group animate-in zoom-in-95 duration-500">
              <img 
                src={enhancedImage} 
                alt="AI Enhanced" 
                style={{ width: containerWidth, height: containerHeight }}
                className="rounded-lg shadow-2xl"
              />
              <button 
                onClick={() => setEnhancedImage(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              >
                Reset AI
              </button>
            </div>
          )}
        </div>

        {enhancedImage && (
          <div className="bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 p-4 rounded-xl text-center w-full">
            <p className="text-sm font-bold">✨ AI Enhancement Applied</p>
            <p className="text-xs">Your image has been reimagined by Nano Banana. You can still adjust export settings below.</p>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-black border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">Canvas Settings</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex justify-between">
                Columns
                <span className="text-gray-900 dark:text-white">{columns}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={columns}
                disabled={!!enhancedImage}
                onChange={(e) => setColumns(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex justify-between">
                Gap
                <span className="text-gray-900 dark:text-white">{gap}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={gap}
                disabled={!!enhancedImage}
                onChange={(e) => setGap(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex justify-between">
                Padding
                <span className="text-gray-900 dark:text-white">{padding}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={padding}
                disabled={!!enhancedImage}
                onChange={(e) => setPadding(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Export Settings</h4>
            
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${format === 'png' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                PNG
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${format === 'jpeg' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                JPEG
              </button>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] mt-4"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              DOWNLOAD
            </button>
          </div>
        </div>

        {!enhancedImage && (
          <AIPanel 
            onGetImageSource={getCanvasBase64} 
            onEnhanced={(newImg: string) => setEnhancedImage(newImg)} 
          />
        )}
      </div>
    </div>
  );
};