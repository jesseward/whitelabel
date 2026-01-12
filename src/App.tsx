import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "./components/SearchBar";
import { AlbumGrid } from "./components/AlbumGrid";
import { Crate } from "./components/Crate";
import { SettingsDialog } from "./components/SettingsDialog";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchService } from "./services/searchService";
import { useCrateStore } from "./store/useCrateStore";
import { useThemeStore } from "./store/useThemeStore";
import { useSettingsStore } from "./store/useSettingsStore";
import type { View } from "./types";

const MosaicCanvas = lazy(() => import("./components/MosaicCanvas").then(module => ({ default: module.MosaicCanvas })));

function App() {
  const [view, setView] = useState<View>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectedAlbums = useCrateStore((state) => state.selectedAlbums);
  const addAlbum = useCrateStore((state) => state.addAlbum);
  const hydrate = useCrateStore((state) => state.hydrate);
  const isHydrated = useCrateStore((state) => state.isHydrated);

  const { theme } = useThemeStore();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4 md:p-8 selection:bg-blue-500/30 transition-colors duration-300 flex flex-col">
      <Header 
        view={view} 
        setView={setView} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <main className="max-w-7xl mx-auto flex-grow w-full">
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

      <Footer />
    </div>
  );
}

export default App;