import React, { useEffect, useState } from "react";
import { AIService, type AIStyle } from "../services/aiService";
import piexif from "piexifjs";

interface MixtapePreviewProps {
  title: string;
  dj?: string;
  extra?: string;
  style: AIStyle;
  onBack: () => void;
}

const createPlaceholder = (
  width: number,
  height: number,
  color: string = "#374151",
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL("image/png");
};

export const MixtapePreview: React.FC<MixtapePreviewProps> = ({
  title,
  dj,
  extra,
  style,
  onBack,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const generateImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const placeholder = createPlaceholder(600, 400);
        const result = await AIService.enhanceMosaic(placeholder, style, {
          title,
          dj: dj || undefined,
          extra: extra || undefined,
        });
        if (isMounted) {
          setImageUrl(result);
        }
      } catch (err) {
        console.error("Failed to generate mixtape cover:", err);
        if (isMounted) {
          setError(
            "Failed to generate mixtape cover. This feature requires access to the Gemini image-to-image model (gemini-3.1-flash-image). Please verify your API key and model permissions in Settings.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    generateImage();

    return () => {
      isMounted = false;
    };
  }, [title, dj, extra, style]);

  const handleExport = (format: "png" | "jpeg") => {
    if (!imageUrl) return;

    let finalDataURL = imageUrl;

    if (format === "jpeg") {
      try {
        const zeroth: Record<number, string> = {};
        const exif: Record<number, string> = {};
        const gps: Record<number, string> = {};

        zeroth[piexif.ImageIFD.Software] = "WhiteLabel Mixtape Creator";

        let metadataString = title;
        if (dj) metadataString += ` by ${dj}`;
        if (extra) metadataString += ` (${extra})`;
        exif[piexif.ExifIFD.UserComment] = "ASCII\0\0\0" + metadataString;

        const exifObj = { "0th": zeroth, Exif: exif, GPS: gps };
        const exifBytes = piexif.dump(exifObj);

        finalDataURL = piexif.insert(exifBytes, imageUrl);
      } catch (err) {
        console.error("Failed to inject metadata:", err);
      }
    }

    const link = document.createElement("a");
    link.download = `mixtape-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.${format}`;
    link.href = finalDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl items-start justify-center">
      <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full aspect-[3/2] flex items-center justify-center relative overflow-hidden">
          {isLoading && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                GENERATING MIXTAPE COVER...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-6 space-y-4">
              <p className="text-red-500 font-bold text-sm">{error}</p>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                Go Back
              </button>
            </div>
          )}

          {imageUrl && !isLoading && (
            <img
              src={imageUrl}
              alt="Generated Mixtape Cover"
              className="rounded-lg shadow-2xl max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </div>

      {imageUrl && !isLoading && (
        <div className="w-full lg:w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-black mb-1">Mixtape Ready!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Style: {style.name}
            </p>
            {dj && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                DJ: {dj}
              </p>
            )}
            {extra && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Info: {extra}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleExport("png")}
              className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all text-sm uppercase tracking-wider"
            >
              Export as PNG
            </button>
            <button
              onClick={() => handleExport("jpeg")}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm uppercase tracking-wider"
            >
              Export as JPEG
            </button>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          <button
            onClick={onBack}
            className="w-full py-3 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-xs uppercase tracking-wider"
          >
            ← Create Another
          </button>
        </div>
      )}
    </div>
  );
};
