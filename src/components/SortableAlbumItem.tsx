import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AlbumArt } from "../types";

interface SortableAlbumItemProps {
  album: AlbumArt;
  onRemove: (id: string) => void;
}

export const SortableAlbumItem = memo(
  ({ album, onRemove }: SortableAlbumItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: album.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex gap-3 items-center group bg-white dark:bg-gray-800 p-2.5 rounded-xl border transition-all duration-200 ${
          isDragging
            ? "border-blue-500 shadow-2xl scale-105 z-50"
            : "border-gray-100 dark:border-gray-700 shadow-sm"
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 2h2v2H3V2zm4 0h2v2H7V2zM3 5h2v2H3V5zm4 0h2v2H7V5zM3 8h2v2H3V8zm4 0h2v2H7V8z" />
          </svg>
        </div>

        <img
          src={album.localUrl || album.url}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-md ring-1 ring-black/5"
          alt=""
        />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate text-gray-800 dark:text-gray-100 leading-none mb-1">
            {album.album}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-bold uppercase tracking-tight">
            {album.artist}
          </p>
        </div>

        <button
          onClick={() => onRemove(album.id)}
          className="text-gray-300 hover:text-red-500 p-1.5 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    );
  },
);
