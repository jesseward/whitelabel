import React, { useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { useTracklistStore } from "../store/useTracklistStore";
import type { View } from "../types";

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  onOpenSettings,
}) => {
  const { theme, toggleTheme } = useThemeStore();
  const { tracks, setTracks } = useTracklistStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setTracks(lines);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black dark:border-white pb-6">
      <div className="flex flex-col gap-2">
        <div
          className="flex items-center gap-3 cursor-pointer group w-fit"
          onClick={() => setView("search")}
          role="button"
          tabIndex={0}
          aria-label="Return to Search"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setView("search");
          }}
        >
          <div className="relative w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite]">
            <div className="w-6 h-6 bg-white dark:bg-black rounded-full absolute" />
            <div className="w-14 h-14 border border-white/20 dark:border-black/20 rounded-full absolute" />
            <div className="w-10 h-10 border border-white/20 dark:border-black/20 rounded-full absolute" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-['Anton'] tracking-wide uppercase bg-black text-white dark:bg-white dark:text-black px-4 py-1 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            WHITELABEL
          </h1>
        </div>
        <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2 pl-2 border-l-2 border-red-500">
          // CRATE_DIGGER_TOOLKIT_V1.0
        </p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm group relative"
          title="Import Tracklist (.txt)"
          aria-label="Import Tracklist"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {tracks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
          )}
        </button>

        <button
          onClick={() => setView("help")}
          className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm group"
          aria-label="Help"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm group"
          aria-label="Settings"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
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
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
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
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {(view === "generate" || view === "help") && (
          <button
            onClick={() => setView("search")}
            className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all font-bold shadow-sm"
          >
            ← Back to Search
          </button>
        )}
      </div>
    </header>
  );
};
