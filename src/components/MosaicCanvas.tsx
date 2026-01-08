import React, { useRef, useEffect, useState } from 'react';
import type { AlbumArt } from '../types';
import { AIPanel } from './AIPanel';
import Konva from 'konva';
import { useMosaicExport } from '../hooks/useMosaicExport';
import { MosaicControls } from './MosaicControls';
import { MosaicStage } from './MosaicStage';

interface MosaicCanvasProps {
  albums: AlbumArt[];
  columns?: number;
  gap?: number;
  padding?: number;
  backgroundColor?: string;
}

export const MosaicCanvas: React.FC<MosaicCanvasProps> = ({
  albums,
  columns: initialColumns = 3,
  gap: initialGap = 2,
  padding: initialPadding = 6,
  backgroundColor: initialBgColor = '#0a0a0a',
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState(800);
  const [columns, setColumns] = useState(initialColumns);
  const [gap, setGap] = useState(initialGap);
  const [padding, setPadding] = useState(initialPadding);
  const [bgColor, setBgColor] = useState(initialBgColor);
  
  // AI Enhanced Image State
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const { format, setFormat, handleExport, getCanvasBase64 } = useMosaicExport({
    stageRef,
    albums
  });

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

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl items-start">
      <div className="flex-1 flex flex-col items-center gap-6 w-full">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full overflow-hidden flex justify-center relative">
          
          <MosaicStage
            stageRef={stageRef}
            albums={albums}
            columns={columns}
            gap={gap}
            padding={padding}
            bgColor={bgColor}
            stageSize={stageSize}
            isHidden={!!enhancedImage}
          />

          {/* AI Result Overlay */}
          {enhancedImage && (
            <div className="relative group animate-in zoom-in-95 duration-500">
              <img 
                src={enhancedImage} 
                alt="AI Enhanced" 
                className="rounded-lg shadow-2xl max-w-full"
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
        <MosaicControls
          bgColor={bgColor}
          setBgColor={setBgColor}
          columns={columns}
          setColumns={setColumns}
          gap={gap}
          setGap={setGap}
          padding={padding}
          setPadding={setPadding}
          format={format}
          setFormat={setFormat}
          onExport={handleExport}
          disabled={!!enhancedImage}
        />

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
