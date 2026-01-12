import React, { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  AI_STYLES,
  AIService,
  type AIStyle,
  FONT_OPTIONS,
  type FontOption,
  LAYOUT_OPTIONS,
  type LayoutOption,
} from "../services/aiService";

interface AIPanelProps {
  onGetImageSource: () => string;
  onEnhanced: (newImage: string) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onGetImageSource,
  onEnhanced,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<AIStyle | null>(null);
  const [selectedFontStyle, setSelectedFontStyle] = useState<FontOption | null>(
    null,
  );
  const [selectedLayout, setSelectedLayout] = useState<LayoutOption | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { apiKeys } = useSettingsStore();

  const hasKey =
    (apiKeys.gemini && apiKeys.gemini.length > 0) ||
    import.meta.env.VITE_GEMINI_API_KEY;

  const handleEnhance = async () => {
    if (!selectedStyle) return;

    setIsProcessing(true);
    setError(null);

    try {
      const imageSource = onGetImageSource();
      const result = await AIService.enhanceMosaic(
        imageSource,
        selectedStyle,
        title,
        selectedFontStyle || undefined,
        selectedLayout || undefined,
      );
      onEnhanced(result);
    } catch (err) {
      setError("AI Enhancement failed. Check your API key or connection.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-purple-500 p-1.5 rounded-lg text-white">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
        <h3 className="text-xl font-black">AI Lab</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Mix Tape Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sofa Syndicate Vol. 1"
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Select Style
          </label>
          <div className="space-y-2">
            {AI_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedStyle?.id === style.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <p
                  className={`text-sm font-bold ${selectedStyle?.id === style.id ? "text-purple-600 dark:text-purple-400" : ""}`}
                >
                  {style.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {title && (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Vinyl Label Layout (Optional)
              </label>
              <div className="space-y-2">
                {LAYOUT_OPTIONS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() =>
                      setSelectedLayout(
                        selectedLayout?.id === layout.id ? null : layout,
                      )
                    }
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedLayout?.id === layout.id
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-bold ${selectedLayout?.id === layout.id ? "text-orange-600 dark:text-orange-400" : ""}`}
                      >
                        {layout.name}
                      </p>
                      {selectedLayout?.id === layout.id && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full font-bold">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {layout.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Font Stylist (Optional)
              </label>
              <div className="space-y-2">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() =>
                      setSelectedFontStyle(
                        selectedFontStyle?.id === font.id ? null : font,
                      )
                    }
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedFontStyle?.id === font.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-bold ${selectedFontStyle?.id === font.id ? "text-blue-600 dark:text-blue-400" : ""}`}
                      >
                        {font.name}
                      </p>
                      {selectedFontStyle?.id === font.id && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                      {font.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-500/10 p-2 rounded-lg border border-red-200 dark:border-red-900/50">
          {error}
        </p>
      )}

      <button
        onClick={handleEnhance}
        disabled={!selectedStyle || isProcessing || !hasKey}
        title={!hasKey ? "Gemini API Key required. Configure in Settings." : ""}
        className={`w-full py-4 font-black rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
          !selectedStyle || isProcessing || !hasKey
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-purple-500/20"
        }`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            PROCESSING...
          </>
        ) : (
          <>
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
            ENHANCE & ADD TITLE
          </>
        )}
      </button>

      {!hasKey && (
        <p className="text-[10px] text-center text-red-500 font-bold">
          API Key Missing
        </p>
      )}

      <p className="text-[9px] text-center text-gray-400 dark:text-gray-600 uppercase font-black tracking-widest">
        Powered by Gemini Nano Banana
      </p>
    </div>
  );
};
