import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "./components/SearchBar";
import { AlbumGrid } from "./components/AlbumGrid";
import { Crate } from "./components/Crate";
import { SettingsDialog } from "./components/SettingsDialog";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HelpView } from "./components/HelpView";
import { SearchService } from "./services/searchService";
import { useCrateStore } from "./store/useCrateStore";
import { useThemeStore } from "./store/useThemeStore";
import { useSettingsStore } from "./store/useSettingsStore";
import { AI_STYLES, type AIStyle } from "./services/aiService";
import type { View } from "./types";

const MosaicCanvas = lazy(() =>
  import("./components/MosaicCanvas").then((module) => ({
    default: module.MosaicCanvas,
  })),
);

const MixtapePreview = lazy(() =>
  import("./components/MixtapePreview").then((module) => ({
    default: module.MixtapePreview,
  })),
);

function App() {
  const [view, setView] = useState<View>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<"mosaic" | "mixtape">(
    "mosaic",
  );
  const [mixtapeTitle, setMixtapeTitle] = useState("");
  const [mixtapeDj, setMixtapeDj] = useState("");
  const [mixtapeExtra, setMixtapeExtra] = useState("");
  const [selectedMixtapeStyle, setSelectedMixtapeStyle] =
    useState<AIStyle | null>(null);
  const handleGenerateMixtape = () => {
    if (!selectedMixtapeStyle || !mixtapeTitle) return;
    setView("mixtape_preview");
  };
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

      <main className="max-w-7xl mx-auto flex-grow w-full space-y-6">
        {view !== "help" && (
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setGeneratorMode("mosaic");
                if (view === "mixtape_preview") {
                  setView("search");
                }
              }}
              className={`py-4 px-6 text-xs font-black tracking-widest uppercase transition-colors border-b-2 ${
                generatorMode === "mosaic" && view !== "mixtape_preview"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Mosaic Creator
            </button>
            <button
              onClick={() => {
                setGeneratorMode("mixtape");
                if (view === "generate" || view === "search") {
                  setView("search");
                }
                if (!selectedMixtapeStyle) {
                  setSelectedMixtapeStyle(
                    AI_STYLES.find((s) => s.id.startsWith("mixtape")) || null,
                  );
                }
              }}
              className={`py-4 px-6 text-xs font-black tracking-widest uppercase transition-colors border-b-2 ${
                generatorMode === "mixtape" || view === "mixtape_preview"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Mixtape Generator
            </button>
          </div>
        )}

        {view === "search" ? (
          generatorMode === "mosaic" ? (
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
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Mixtape Title
                </label>
                <input
                  type="text"
                  value={mixtapeTitle}
                  onChange={(e) => setMixtapeTitle(e.target.value)}
                  placeholder="e.g. Summer Daze '94"
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  DJ / Artist Name (Optional)
                </label>
                <input
                  type="text"
                  value={mixtapeDj}
                  onChange={(e) => setMixtapeDj(e.target.value)}
                  placeholder="e.g. DJ Shadow"
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Extra Text / Info (Optional)
                </label>
                <input
                  type="text"
                  value={mixtapeExtra}
                  onChange={(e) => setMixtapeExtra(e.target.value)}
                  placeholder="e.g. Live at The Edge or Side A / B"
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Select Cassette Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AI_STYLES.filter((s) => s.id.startsWith("mixtape")).map(
                    (style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedMixtapeStyle(style)}
                        className={`p-6 rounded-xl border text-left transition-all flex flex-col justify-between h-36 ${
                          selectedMixtapeStyle?.id === style.id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 ring-2 ring-purple-500/20"
                            : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-base font-black ${selectedMixtapeStyle?.id === style.id ? "text-purple-600 dark:text-purple-400" : ""}`}
                          >
                            {style.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {style.description}
                          </p>
                        </div>
                        {selectedMixtapeStyle?.id === style.id && (
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full font-black self-start uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateMixtape}
                disabled={!mixtapeTitle || !selectedMixtapeStyle}
                className={`w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                  !mixtapeTitle || !selectedMixtapeStyle
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-purple-500/20"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                GENERATE MIXTAPE COVER
              </button>
            </div>
          )
        ) : view === "help" ? (
          <HelpView />
        ) : view === "mixtape_preview" ? (
          <div className="flex flex-col items-center w-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              {selectedMixtapeStyle && (
                <MixtapePreview
                  title={mixtapeTitle}
                  dj={mixtapeDj}
                  extra={mixtapeExtra}
                  style={selectedMixtapeStyle}
                  onBack={() => setView("search")}
                />
              )}
            </Suspense>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              Preview Your Artwork
            </h2>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              }
            >
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
