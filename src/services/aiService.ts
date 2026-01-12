import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSettingsStore } from "../store/useSettingsStore";

const MODEL_NAME =
  import.meta.env.VITE_GEMINI_MODEL || "gemini-3-pro-image-preview";

export interface AIStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  textInstructions: string;
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
  },
  {
    id: "polaroid",
    name: "Polaroid Grid",
    description: "Makes each cover look like a separate polaroid.",
    prompt:
      "Process this image so each album cover appears to be an individual Polaroid photo with white borders, slightly rotated for a messy, organic feel on a dark tabletop.",
    textInstructions:
      "Write the title at the bottom of the image in a casual, black permanent marker handwriting style, as if written on the bottom of a photo frame.",
  },
  {
    id: "house",
    name: "House & Electronic",
    description: "Clean, classic 1990s house vibe with light accents.",
    prompt:
      'Apply a clean, to this music album art mosaic with a high-contrast minimalist filter with soft neon glows around the edges. Mimic the center label of a 12" vinyl with a circular mask. Apply a light cyan-to-purple gradient over the entire image at 10% opacity.',
    textInstructions:
      'Render the title in a geometric Sans-Serif font (like Inter or Helvetica). Use clean, spaced-out Monospace fonts for secondary details to give a "technical" look.',
  },
  {
    id: "hiphop",
    name: "Hip-Hop & Rap",
    description: "Gritty, bold, street-style aesthetic.",
    prompt:
      "Convert to high-contrast black and white with heavy grain and a distressed street-poster texture. Add photocopy noise and halftone dots in the shadows.",
    textInstructions:
      'Render the title in a bold, heavy-hitting font like Impact or Anton. Use a "hand-style" graffiti font for artist names.',
  },
  {
    id: "jungle",
    name: "Jungle & DnB",
    description: "Industrial, cyber, Y2K aesthetic.",
    prompt:
      "Add futuristic industrial HUD elements and a CRT monitor scanline effect with green hazmat tints. Overlay transparent digital camouflage patterns and add chromatic aberration.",
    textInstructions:
      "Render the title in a wide, tech-focused font like Eurostile or Michroma. Use stencil-style fonts for secondary text.",
  },
  {
    id: "acid",
    name: "Acid Flashback",
    description: "Early 90s rave psychedelic vibe.",
    prompt:
      "Early 90s psychedelic rave flyer aesthetic. Acid house  patterns swirling around the edges. low esolution, blacklight reactive vibe.",
    textInstructions:
      'Render the title in "warped" or "liquid" fonts that look like they are melting. Use primitive futuristic fonts for secondary text.',
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
    instruction: "Add a distinct, solid-color header strip across the entire top of the image. The strip should look like a classic vinyl 'Stereo' or 'Original Master Recording' banner. Ensure this area has a clear, high-contrast background suitable for text.",
  },
  {
    id: "footer",
    name: "Bottom Footer Strip",
    description: "Clean band at the bottom for title",
    instruction: "Add a distinct, solid-color footer strip across the entire bottom of the image. This area should look like a dedicated title space with a clear, high-contrast background suitable for text.",
  },
  {
    id: "sticker",
    name: "Hype Sticker",
    description: "Sticker on shrink wrap (Top Right)",
    instruction: "Add a realistic 'hype sticker' to the top-right corner of the image. It should look like it's adhered to the shrink wrap of a vinyl record. The sticker should have a solid background (round or rectangular) providing a clear area for text.",
  },
];

export const AIService = {
  enhanceMosaic: async (
    base64Image: string,
    style: AIStyle,
    title?: string,
    fontStyle?: FontOption,
    layout?: LayoutOption,
  ): Promise<string> => {
    const apiKey =
      useSettingsStore.getState().apiKeys.gemini ||
      import.meta.env.VITE_GEMINI_API_KEY;
    const mockMode = !apiKey || apiKey.startsWith("your_");

    let finalPrompt = style.prompt;

    if (layout) {
      finalPrompt += ` ${layout.instruction}`;
    }

    if (title) {
      const textInstruction = fontStyle
        ? fontStyle.instruction
        : style.textInstructions;
      
      let placementInstruction = "Ensure the text is clearly legible but integrated into the style.";
      if (layout) {
        placementInstruction = `Place the text "${title}" INSIDE the ${layout.name.toLowerCase().includes('sticker') ? 'hype sticker' : 'strip'} created above.`;
      }

      finalPrompt += ` Add the text "${title}" to the image. ${textInstruction} ${placementInstruction}`;
    }

    if (mockMode) {
      console.log("AI Service: Running in MOCK mode with prompt:", finalPrompt);
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      throw new Error("No image data found in response");
    }

    const { mimeType, data } = firstPart.inlineData;
    return `data:${mimeType};base64,${data}`;
  },
};
