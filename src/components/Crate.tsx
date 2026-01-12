import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCrateStore } from "../store/useCrateStore";
import { SortableAlbumItem } from "./SortableAlbumItem";
import { SearchService } from "../services/searchService";
import { SEARCH_CONFIG } from "../constants/searchConfig";

interface CrateProps {
  onGenerate: () => void;
}

export const Crate: React.FC<CrateProps> = ({ onGenerate }) => {
  const {
    selectedAlbums,
    removeAlbum,
    reorderAlbums,
    clearCrate,
    shuffleAlbums,
    addAlbum,
  } = useCrateStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedAlbums.findIndex((a) => a.id === active.id);
      const newIndex = selectedAlbums.findIndex((a) => a.id === over.id);
      reorderAlbums(oldIndex, newIndex);
    }
  };

  const processBatch = async (candidates: string[]) => {
    setIsUploading(true);
    let successCount = 0;
    const maxResults = SEARCH_CONFIG.BATCH_SIZE;

    // Shuffle candidates to pick randomly
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    try {
      for (const query of shuffled) {
        if (successCount >= maxResults) break;
        if (!query.trim()) continue;

        try {
          // Search for the item
          const results = await SearchService.searchAll(query, 1);

          // If we found a match that isn't already in the crate (simple check)
          if (results.length > 0) {
            const bestMatch = results[0];
            await addAlbum(bestMatch);
            successCount++;
          }
        } catch (err) {
          console.warn(`Failed to fetch for query: ${query}`, err);
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const lines = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        processBatch(lines);
      }
    };
    reader.readAsText(file);
  };

  return (
    <aside className="bg-white dark:bg-gray-900 p-6 rounded-2xl h-fit sticky top-8 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          Your Crate
          <motion.span
            key={selectedAlbums.length}
            initial={{ scale: 1.5, color: "#3b82f6" }}
            animate={{ scale: 1, color: "#ffffff" }}
            className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg shadow-blue-500/20"
          >
            {selectedAlbums.length}
          </motion.span>
        </h2>

        <div className="flex gap-4 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`text-[10px] uppercase font-black tracking-widest transition-colors flex items-center gap-1 ${isUploading ? "text-blue-500 animate-pulse" : "text-gray-400 hover:text-blue-500"}`}
            title="Batch Upload Text File"
          >
            {isUploading ? (
              "Loading..."
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import
              </>
            )}
          </button>

          {selectedAlbums.length > 1 && (
            <button
              onClick={shuffleAlbums}
              className="text-[10px] text-gray-400 hover:text-blue-500 uppercase font-black tracking-widest transition-colors flex items-center gap-1"
              title="Shuffle Crate"
            >
              <svg
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M4 4h7m-7 8h3m10-8h-7l-3.5 10M16 12h5m-5 8h5"
                />
              </svg>
              Shuffle
            </button>
          )}
          {selectedAlbums.length > 0 && (
            <button
              onClick={clearCrate}
              className="text-[10px] text-gray-400 hover:text-red-500 uppercase font-black tracking-widest transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {selectedAlbums.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 px-4 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl"
        >
          <p className="text-gray-400 dark:text-gray-500 text-sm italic font-medium">
            Add some albums to start building your masterpiece.
          </p>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedAlbums.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {selectedAlbums.map((album) => (
                  <motion.div
                    key={album.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <SortableAlbumItem album={album} onRemove={removeAlbum} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {selectedAlbums.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGenerate}
          className="w-full mt-6 py-4 bg-gray-950 dark:bg-white text-white dark:text-black font-black rounded-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all shadow-lg flex items-center justify-center gap-2 group"
        >
          CREATE COVER
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </motion.button>
      )}
    </aside>
  );
};
