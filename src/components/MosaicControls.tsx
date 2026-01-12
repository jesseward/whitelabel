import React from "react";

interface MosaicControlsProps {
  bgColor: string;
  setBgColor: (color: string) => void;
  columns: number;
  setColumns: (cols: number) => void;
  gap: number;
  setGap: (gap: number) => void;
  padding: number;
  setPadding: (pad: number) => void;
  format: "png" | "jpeg";
  setFormat: (format: "png" | "jpeg") => void;
  onExport: () => void;
  disabled?: boolean;
}

export const MosaicControls: React.FC<MosaicControlsProps> = ({
  bgColor,
  setBgColor,
  columns,
  setColumns,
  gap,
  setGap,
  padding,
  setPadding,
  format,
  setFormat,
  onExport,
  disabled,
}) => {
  const colors = [
    "#0a0a0a",
    "#ffffff",
    "#1f2937",
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#16a34a",
    "#2563eb",
    "#7c3aed",
    "#db2777",
  ];

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex justify-between">
            Background
            <span className="text-gray-900 dark:text-white uppercase">
              {bgColor}
            </span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setBgColor(c)}
                disabled={disabled}
                className={`w-full aspect-square rounded-lg border transition-all ${
                  bgColor === c
                    ? "border-blue-500 scale-110 shadow-md ring-2 ring-blue-500/20"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="relative col-span-5 mt-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-8 cursor-pointer rounded-lg overflow-hidden opacity-0 absolute inset-0 z-10"
                disabled={disabled}
              />
              <div className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Custom Color Picker
              </div>
            </div>
          </div>
        </div>

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
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Export Settings
        </h4>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setFormat("png")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${format === "png" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            PNG
          </button>
          <button
            onClick={() => setFormat("jpeg")}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${format === "jpeg" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            JPEG
          </button>
        </div>

        <button
          onClick={onExport}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] mt-4"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          DOWNLOAD
        </button>
      </div>
    </div>
  );
};
