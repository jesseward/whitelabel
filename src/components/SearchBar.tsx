import React, { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { PROVIDER_LIST } from "../constants/providers";
import { ProviderIcon } from "./ProviderIcon";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [showTips, setShowTips] = useState(false);
  const { enabledProviders, toggleProvider, apiKeys } = useSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const providers = PROVIDER_LIST.filter((p) => p.id !== "mock");

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or use artist: / album: filters..."
            className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mr-2 w-full md:w-auto">
            Providers:
          </span>
          {providers.map((p) => {
            const needsKey = p.requiresKey;
            const apiKey =
              p.id in apiKeys ? apiKeys[p.id as keyof typeof apiKeys] : "";
            const hasKey =
              !needsKey ||
              (apiKey && apiKey.length > 0) ||
              import.meta.env[`VITE_${p.id.toUpperCase()}_API_KEY`] ||
              import.meta.env[`VITE_${p.id.toUpperCase()}_TOKEN`];
            const isDisabled = needsKey && !hasKey;

            return (
              <button
                key={p.id}
                onClick={() => !isDisabled && toggleProvider(p.id)}
                disabled={isDisabled}
                title={
                  isDisabled
                    ? `${p.name} requires an API Key. Configure it in Settings.`
                    : ""
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                    : enabledProviders[p.id]
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <ProviderIcon provider={p.id} />
                <span className="text-xs font-bold">{p.name}</span>
                {isDisabled && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-red-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
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
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showTips ? "Hide Tips" : "Search Tips"}
          </button>

          <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-widest">
            artist:"Aphex Twin"
          </p>
        </div>
      </div>

      {showTips && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Advanced Filters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">
                  artist:name
                </code>{" "}
                Filter by specific artist
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">
                  album:title
                </code>{" "}
                Search for a specific album
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">
                  "exact phrase"
                </code>{" "}
                Use quotes for literal matches
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <code className="text-gray-400 italic">Example:</code>{" "}
                artist:Autechre album:Amber
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
