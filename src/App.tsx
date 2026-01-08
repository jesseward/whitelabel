import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "./components/SearchBar";
import { AlbumGrid } from "./components/AlbumGrid";
import { Crate } from "./components/Crate";
import { SettingsDialog } from "./components/SettingsDialog";
import { SearchService } from "./services/searchService";
import { useCrateStore } from "./store/useCrateStore";
import { useThemeStore } from "./store/useThemeStore";
import { useSettingsStore } from "./store/useSettingsStore";

const MosaicCanvas = lazy(() => import("./components/MosaicCanvas").then(module => ({ default: module.MosaicCanvas })));

type View = "search" | "generate";

function App() {
  const [view, setView] = useState<View>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectedAlbums = useCrateStore((state) => state.selectedAlbums);
  const addAlbum = useCrateStore((state) => state.addAlbum);
  const hydrate = useCrateStore((state) => state.hydrate);
  const isHydrated = useCrateStore((state) => state.isHydrated);

  const { theme, toggleTheme } = useThemeStore();
  const { enabledProviders } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const {
    data: albums = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["albums", searchQuery, enabledProviders],
    queryFn: () => SearchService.searchAll(searchQuery, 1, enabledProviders),
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4 md:p-8 selection:bg-blue-500/30 transition-colors duration-300">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black dark:border-white pb-6">
        <div className="flex flex-col gap-2">
          <div 
            className="flex items-center gap-3 cursor-pointer group w-fit"
            onClick={() => setView("search")}
          >
            <div className="relative w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite]">
              <div className="w-6 h-6 bg-white dark:bg-black rounded-full absolute" />
              <div className="w-14 h-14 border border-white/20 dark:border-black/20 rounded-full absolute" />
              <div className="w-10 h-10 border border-white/20 dark:border-black/20 rounded-full absolute" />
            </div>
            
            <h1 className="text-7xl font-['Anton'] tracking-wide uppercase bg-black text-white dark:bg-white dark:text-black px-4 py-1 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              WHITELABEL
            </h1>
          </div>
          <p className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2 pl-2 border-l-2 border-red-500">
            // CRATE_DIGGER_TOOLKIT_V1.0
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
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

          {view === "generate" && (
            <button
              onClick={() => setView("search")}
              className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all font-bold shadow-sm"
            >
              ← Back to Search
            </button>
          )}
        </div>
      </header>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <main className="max-w-7xl mx-auto">
        {view === "search" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <SearchBar onSearch={setSearchQuery} />

              {isError && (
                <div className="bg-red-900/10 border border-red-500/50 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
                  Error searching for albums: {(error as Error).message}
                </div>
              )}

              <AlbumGrid
                albums={albums}
                onSelect={addAlbum}
                isLoading={isLoading}
              />
            </div>

            <div className="lg:col-span-1">
              <Crate onGenerate={() => setView("generate")} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              Preview Your Artwork
            </h2>
            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <MosaicCanvas albums={selectedAlbums} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
