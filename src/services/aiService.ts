import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSettingsStore } from "../store/useSettingsStore";

const MODEL_NAME =
  import.meta.env.VITE_GEMINI_MODEL || "gemini-3.1-flash-image";

export interface AIStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  textInstructions: string;
  supportedLayouts?: string[]; // IDs of supported layouts (from LAYOUT_OPTIONS)
}

export const AI_STYLES: AIStyle[] = [
  {
    id: "vintage",
    name: "Vintage",
    description: "Adds grain, faded colors, and paper texture.",
    prompt:
      "Transform this music album art mosaic into a vintage 1970s print. Add realistic paper texture, slight color fading, and film grain. Maintain the layout but make it look like a physical relic.",
    textInstructions:
      "Render the title in a weathered, distressed serif typeface (like Cooper Black or Windsor). The text should look like it was printed with ink that has slightly bled into the paper. Place it at the top or bottom in a classic album title layout.",
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "polaroid",
    name: "Polaroid Grid",
    description: "Makes each cover look like a separate polaroid.",
    prompt:
      "Process this image so each album cover appears to be an individual Polaroid photo with white borders, slightly rotated for a messy, organic feel on a dark tabletop.",
    textInstructions:
      "Write the title at the bottom of the image in a casual, black permanent marker handwriting style, as if written on the bottom of a photo frame.",
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "house",
    name: "House & Electronic",
    description: "Clean, classic 1990s house vibe with light accents.",
    prompt:
      'Apply a clean, to this music album art mosaic with a high-contrast minimalist filter with soft neon glows around the edges. Mimic the center label of a 12" vinyl with a circular mask. Apply a light cyan-to-blue gradient over the entire image at 10% opacity.',
    textInstructions:
      'Render the title in a geometric Sans-Serif font (like Inter or Helvetica). Use clean, spaced-out Monospace fonts for secondary details to give a "technical" look.',
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "hiphop",
    name: "Hip-Hop & Rap",
    description: "Gritty, bold, street-style aesthetic.",
    prompt:
      "Convert to high-contrast black and white with heavy grain and a distressed street-poster texture. Add photocopy noise and halftone dots in the shadows.",
    textInstructions:
      'Render the title in a bold, heavy-hitting font like Impact or Anton. Use a "hand-style" graffiti font for artist names.',
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "jungle",
    name: "Jungle & DnB",
    description: "Industrial, cyber, Y2K aesthetic.",
    prompt:
      "Add futuristic industrial HUD elements and a CRT monitor scanline effect with green hazmat tints. Overlay transparent digital camouflage patterns and add chromatic aberration.",
    textInstructions:
      "Render the title in a wide, tech-focused font like Eurostile or Michroma. Use stencil-style fonts for secondary text.",
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "acid",
    name: "Acid Flashback",
    description: "Early 90s rave psychedelic vibe.",
    prompt:
      "Early 90s psychedelic rave flyer aesthetic. Acid house  patterns swirling around the edges. low esolution, blacklight reactive vibe.",
    textInstructions:
      'Render the title in "warped" or "liquid" fonts that look like they are melting. Use primitive futuristic fonts for secondary text.',
    supportedLayouts: ["header", "footer", "sticker"],
  },
  {
    id: "mixtape_raw",
    name: "90s Branded Cassette",
    description:
      "Classic Maxell-style cassette with handwritten sticker label.",
    prompt:
      "Transform this image into a realistic 3D render of a 1990s audio cassette tape (specifically mimicking a Maxell XLII 90). The cassette tape itself must fill the entire frame, matching the 3:2 aspect ratio of the image perfectly. There should be no visible background, borders, or empty space around the cassette; the cassette shell is the full width and height of the image. The cassette shell must be dark gray textured plastic with visible screws in the corners. It must feature the classic Maxell XLII markings: 'ENERGY EFFICIENT AND ANTI-RESONANCE CASSETTE MECHANISM' in gold/red text at the top, 'XLII 90' in bold gold/red text below it, and 'POSITION HIGH' in smaller text. A gold 'maxell' logo must be printed in the lower center. In the center, there must be a rectangular white paper sticker label with a slightly worn, matte texture, with a large 'A' printed on the left side. Use the color palette of the input image to influence minor details.",
    textInstructions:
      "Write the provided text (like title, DJ) in a realistic, slightly messy handwritten marker style (reminiscent of black or red Sharpie) inside the white paper sticker label. The handwriting should be uppercase.",
    supportedLayouts: [],
  },
  {
    id: "mixtape_rave",
    name: "90s Rave Mixtape",
    description:
      "Clear cassette tape with custom printed label and rave logos.",
    prompt:
      "Transform this image into a realistic 3D render of a 1990s rave mixtape cassette tape. The clear cassette tape itself must fill the entire frame, matching the 3:2 aspect ratio of the image perfectly. There should be no visible background, borders, or empty space around the cassette; the clear plastic shell is the full width and height of the image. The shell must be clear, transparent plastic, revealing the internal mechanics, tape wheels, and brown magnetic tape. It should have a matte black printed label area in the center. Add small, simple rave-themed logos (like an atom, biohazard symbol, or smiley face) on the left and right sides of the label in a single color. Use the color palette of the input image to influence the color of the text and logos.",
    textInstructions:
      "Render the provided text (like title, DJ, extra info) in a bold, stylized stencil or retro-futuristic font (reminiscent of 90s rave flyers) printed directly on the black label area of the clear cassette. Arrange the text elements cleanly.",
    supportedLayouts: [],
  },
];

export interface FontOption {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "jungle",
    name: "Jungle / DnB",
    description: "Distressed, industrial, Y2K",
    instruction:
      'Render the text using distressed, industrial, or "Y2K Cyber" fonts common in Jungle and Drum & Bass culture.',
  },
  {
    id: "hiphop",
    name: "Hip-Hop",
    description: "Graffiti tags or bold Impact",
    instruction:
      'Render the text using graffiti tags or bold, heavy "Impact" style fonts common in Hip-Hop culture.',
  },
  {
    id: "house",
    name: "House",
    description: "Minimalist, Swiss-style",
    instruction:
      "Render the text using minimalist, Swiss-style typography common in House music culture.",
  },
  {
    id: "handwritten",
    name: "Handwritten Marker",
    description: "Casual, slightly messy Sharpie style",
    instruction:
      "Render the text in a realistic, slightly messy handwritten marker style, as if written with a Sharpie.",
  },
  {
    id: "rave",
    name: "90s Rave",
    description: "Stencil or retro-futuristic flyer style",
    instruction:
      "Render the text in a bold, stylized stencil or retro-futuristic font typical of 90s rave flyers.",
  },
];

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "header",
    name: "Top Header Strip",
    description: "Classic 'Stereo' or 'Master' strip at the top",
    instruction:
      "Add a distinct, solid-color header strip across the entire top of the image. The strip should look like a classic vinyl 'Stereo' or 'Original Master Recording' banner. Ensure this area has a clear, high-contrast background suitable for text.",
  },
  {
    id: "footer",
    name: "Bottom Footer Strip",
    description: "Clean band at the bottom for title",
    instruction:
      "Add a distinct, solid-color footer strip across the entire bottom of the image. This area should look like a dedicated title space with a clear, high-contrast background suitable for text.",
  },
  {
    id: "sticker",
    name: "Hype Sticker",
    description: "Sticker on shrink wrap (Top Right)",
    instruction:
      "Add a realistic 'hype sticker' to the top-right corner of the image. It should look like it's adhered to the shrink wrap of a vinyl record. The sticker should have a solid background (round or rectangular) providing a clear area for text.",
  },
];

export interface AIEnhanceOptions {
  title?: string;
  dj?: string;
  extra?: string;
  fontStyle?: FontOption;
  layout?: LayoutOption;
}

const createMockCassette = (
  styleId: string,
  options?: AIEnhanceOptions,
): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background (only visible in rounded corners)
  ctx.fillStyle = styleId === "mixtape_raw" ? "#f3f4f6" : "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cassette Body (Full Bleed)
  ctx.fillStyle = "#374151";
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 12;
  const x = 0;
  const y = 0;
  const w = 600;
  const h = 400;
  const r = 30;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();

  // Cassette Center Window
  ctx.fillStyle = styleId === "mixtape_raw" ? "#1f2937" : "#111827";
  ctx.fillRect(150, 140, 300, 120);

  // Tape Reels
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.arc(225, 200, 30, 0, Math.PI * 2);
  ctx.arc(375, 200, 30, 0, Math.PI * 2);
  ctx.fill();

  // Teeth
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 4;
  for (const centerX of [225, 375]) {
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(centerX, 200);
      ctx.lineTo(centerX + Math.cos(angle) * 24, 200 + Math.sin(angle) * 24);
      ctx.stroke();
    }
  }

  if (styleId === "mixtape_raw") {
    // Maxell Markings
    ctx.fillStyle = "#f59e0b"; // Gold
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "ENERGY EFFICIENT AND ANTI-RESONANCE CASSETTE MECHANISM",
      300,
      30,
    );

    ctx.font = "900 20px sans-serif"; // Using 900 for extra bold
    ctx.fillText("XLII 90", 300, 55);

    ctx.font = "bold 10px sans-serif";
    ctx.fillText("POSITION • HIGH", 300, 75);

    // Large 'A' on the left
    ctx.fillStyle = "#10b981";
    ctx.font = "italic bold 36px serif";
    ctx.textAlign = "left";
    ctx.fillText("A", 70, 270);

    // maxell logo in middle
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("maxell", 300, 105);

    // White Sticker Label
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(110, 280, 380, 90, 5);
    ctx.fill();
    ctx.stroke();

    // Noise Reduction info
    ctx.fillStyle = "#9ca3af";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("N.R.  YES  NO", 480, 295);

    // Title text (Handwritten)
    ctx.fillStyle = "#111827";
    ctx.font = "bold 22px 'Courier New', Courier, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let textY = 310;
    if (options?.title) {
      ctx.fillText(options.title.toUpperCase(), 130, textY);
      textY += 25;
    }
    if (options?.dj) {
      ctx.fillStyle = "#ef4444"; // Red for DJ name
      ctx.fillText(`BY ${options.dj.toUpperCase()}`, 130, textY);
      textY += 20;
    }
    if (options?.extra) {
      ctx.fillStyle = "#4b5563";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(options.extra.toUpperCase(), 130, textY);
    }
  } else {
    // Rave Style
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 50, 440, 300, 10);
    ctx.stroke();

    // Title text
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 28px 'Impact', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textY = 95;
    if (options?.title) {
      ctx.fillText(options.title.toUpperCase(), 300, textY);
      textY += 35;
    }
    if (options?.dj) {
      ctx.fillStyle = "#a5f3fc";
      ctx.font = "bold 20px 'Impact', sans-serif";
      ctx.fillText(`DJ: ${options.dj.toUpperCase()}`, 300, textY);
      textY += 30;
    }

    // Subtitle / Extra info
    ctx.fillStyle = "#06b6d4";
    ctx.font = "12px monospace";
    let extraY = 290;
    if (options?.extra) {
      ctx.fillText(options.extra.toUpperCase(), 300, extraY);
      extraY += 20;
    }

    // Simple Logos
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(130, 200, 12, 28, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(130, 200, 12, 28, -Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.arc(130, 200, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(470, 200, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(470, 200, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL("image/png");
};

export const buildEnhancePrompt = (
  style: AIStyle,
  options?: AIEnhanceOptions,
): string => {
  let finalPrompt = style.prompt;

  if (options?.layout) {
    finalPrompt += ` ${options.layout.instruction}`;
  }

  const textParts: string[] = [];

  if (options?.title) {
    textParts.push(`title: "${options.title}"`);
  }
  if (options?.dj) {
    textParts.push(`artist/DJ name: "${options.dj}"`);
  }
  if (options?.extra) {
    textParts.push(`additional info: "${options.extra}"`);
  }

  if (textParts.length > 0) {
    const textInstruction = options?.fontStyle
      ? options.fontStyle.instruction
      : style.textInstructions;

    let placementInstruction =
      "Ensure all provided text is clearly legible, integrated naturally into the design, and follows the style's typical placement.";

    const layout = options?.layout;
    if (layout) {
      placementInstruction = `Place the primary text INSIDE the ${layout.name.toLowerCase().includes("sticker") ? "hype sticker" : "strip"} created above.`;
    }

    const strictTextRule =
      "CRITICAL: Do NOT add any text, words, or labels to the image other than the exact values provided. Do not invent subtitles, tracklists, or release years.";

    finalPrompt += ` Add the following text elements to the image: ${textParts.join(", ")}. ${textInstruction} ${placementInstruction} ${strictTextRule}`;
  }

  return finalPrompt;
};

export const AIService = {
  enhanceMosaic: async (
    base64Image: string,
    style: AIStyle,
    options?: AIEnhanceOptions,
  ): Promise<string> => {
    const apiKey =
      useSettingsStore.getState().apiKeys.gemini ||
      import.meta.env.VITE_GEMINI_API_KEY;
    const mockMode = !apiKey || apiKey.startsWith("your_");

    const finalPrompt = buildEnhancePrompt(style, options);

    if (mockMode) {
      console.log("AI Service: Running in MOCK mode with prompt:", finalPrompt);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (style.id.startsWith("mixtape")) {
        return createMockCassette(style.id, options);
      }
      return base64Image;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const base64Data = base64Image.split(",")[1];

    const result = await model.generateContent([
      finalPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        },
      },
    ]);

    const response = result.response;

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    const firstCandidate = response.candidates[0];
    const firstPart = firstCandidate.content.parts[0];

    if (!firstPart || !firstPart.inlineData) {
      throw new Error(
        `No image data found in response. The model '${MODEL_NAME}' may not support image-to-image output. Ensure you are using a model that supports image generation/multimodal output.`,
      );
    }

    const { mimeType, data } = firstPart.inlineData;
    return `data:${mimeType};base64,${data}`;
  },
};
