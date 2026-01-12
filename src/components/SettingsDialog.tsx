import { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { PROVIDERS } from "../constants/providers";
import type { Provider } from "../types";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  const { enabledProviders, apiKeys, toggleProvider, setApiKey } =
    useSettingsStore();
  const [activeTab, setActiveTab] = useState<"providers" | "keys">("providers");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("providers")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "providers"
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Data Providers
          </button>
          <button
            onClick={() => setActiveTab("keys")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "keys"
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            API Keys
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "providers" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Toggle which services you want to search for album art.
              </p>

              {Object.entries(enabledProviders).map(([key, enabled]) => {
                const provider = PROVIDERS[key as Provider];
                const needsKey = provider?.requiresKey;
                const apiKeysKey = key as keyof typeof apiKeys;
                const hasKey =
                  !needsKey ||
                  (apiKeys[apiKeysKey] && apiKeys[apiKeysKey].length > 0) ||
                  import.meta.env[`VITE_${key.toUpperCase()}_API_KEY`] ||
                  import.meta.env[`VITE_${key.toUpperCase()}_TOKEN`];
                const isDisabled = needsKey && !hasKey;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isDisabled
                        ? "bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-75"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="capitalize font-medium dark:text-gray-200">
                        {provider?.name || key}
                      </span>
                      {isDisabled && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-500/20 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                          Key Required
                        </span>
                      )}
                    </div>
                    <label
                      className={`relative inline-flex items-center ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled && !isDisabled}
                        disabled={isDisabled}
                        onChange={() => toggleProvider(key as Provider)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isDisabled ? "bg-gray-200 dark:bg-gray-800" : "bg-gray-200"}`}
                      ></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "keys" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add your own API keys to enable these services. Keys are stored
                locally in your browser.
              </p>

              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  Last.fm API Key
                </label>
                <input
                  type="password"
                  value={
                    apiKeys.lastfm || import.meta.env.VITE_LASTFM_API_KEY || ""
                  }
                  onChange={(e) => setApiKey("lastfm", e.target.value)}
                  placeholder="Enter your Last.fm API Key"
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
                <p className="text-xs text-gray-400">
                  Required for Last.fm search.{" "}
                  <a
                    href="https://www.last.fm/api/account/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Get key
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  Discogs Personal Access Token
                </label>
                <input
                  type="password"
                  value={
                    apiKeys.discogs || import.meta.env.VITE_DISCOGS_TOKEN || ""
                  }
                  onChange={(e) => setApiKey("discogs", e.target.value)}
                  placeholder="Enter your Discogs Token"
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
                <p className="text-xs text-gray-400">
                  Required for Discogs search.{" "}
                  <a
                    href="https://www.discogs.com/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Get token
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium dark:text-gray-300">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={
                    apiKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY || ""
                  }
                  onChange={(e) => setApiKey("gemini", e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
                <p className="text-xs text-gray-400">
                  Required for AI enhancements.{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Get key
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
