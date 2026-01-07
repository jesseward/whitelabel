import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlbumArt } from '../types';
import { useCrateStore } from '../store/useCrateStore';
import { getProxiedUrl } from '../utils/imageProxy';

interface AlbumGridProps {
  albums: AlbumArt[];
  onSelect: (album: AlbumArt) => void;
  isLoading: boolean;
}

const AlbumCard = memo(({ album, onSelect, isSelected }: { album: AlbumArt; onSelect: (album: AlbumArt) => void; isSelected: boolean }) => {
  const [hasError, setHasError] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  if (hasError) return null;

  const thumbnailUrl = getProxiedUrl(album.url, 'thumb');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelected) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: rotate.x,
        rotateY: rotate.y,
        scale: isSelected ? 0.95 : 1
      }}
      whileHover={!isSelected ? { scale: 1.05, zIndex: 10 } : {}}
      whileTap={!isSelected ? { scale: 0.98 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative cursor-pointer overflow-hidden rounded-xl bg-white dark:bg-gray-800 transition-shadow duration-300 shadow-sm hover:shadow-2xl ring-1 ${
        isSelected 
          ? 'ring-blue-500 opacity-75 shadow-inner' 
          : 'ring-gray-200 dark:ring-gray-800'
      }`}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      onClick={() => !isSelected && onSelect(album)}
    >
      <img
        src={thumbnailUrl}
        alt={`${album.artist} - ${album.album}`}
        className={`aspect-square w-full object-cover transition-all duration-500 ${isSelected ? 'grayscale-[0.5] blur-[1px]' : ''}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
      
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-blue-600/20 backdrop-blur-[1px]"
          >
            <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <p className="font-bold text-sm text-white truncate leading-tight">{album.album}</p>
        <p className="text-xs text-gray-300 truncate mt-0.5">{album.artist}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-400/10 px-1.5 py-0.5 rounded">{album.provider}</span>
          {!isSelected && (
            <span className="bg-white/20 text-white p-1 rounded-full backdrop-blur-md">
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onSelect, isLoading }) => {
  const selectedAlbums = useCrateStore(state => state.selectedAlbums);
  const selectedIds = new Set(selectedAlbums.map(a => a.id));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-square w-full rounded-xl bg-gray-100 dark:bg-gray-900 animate-pulse border border-gray-200 dark:border-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {albums.map((album) => (
          <AlbumCard 
            key={album.id} 
            album={album} 
            onSelect={onSelect} 
            isSelected={selectedIds.has(album.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};