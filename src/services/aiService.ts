import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSettingsStore } from '../store/useSettingsStore';

const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || "gemini-3-pro-image-preview";

export interface AIStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  textInstructions: string;
}

export const AI_STYLES: AIStyle[] = [
  {
    id: 'vintage',
    name: 'Vintage Print',
    description: 'Adds grain, faded colors, and paper texture.',
    prompt: 'Transform this music album mosaic into a vintage 1970s print. Add realistic paper texture, slight color fading, and film grain. Maintain the layout but make it look like a physical relic.',
    textInstructions: 'Render the title in a weathered, distressed serif typeface (like Cooper Black or Windsor). The text should look like it was printed with ink that has slightly bled into the paper. Place it at the top or bottom in a classic album title layout.'
  },
  {
    id: 'neon',
    name: 'Cyberpunk Glow',
    description: 'Neon highlights and high-contrast darks.',
    prompt: 'Enhance this mosaic with a cyberpunk aesthetic. Add neon blue and pink glows to the edges of the album covers. Increase contrast and add a subtle digital scanline effect.',
    textInstructions: 'Render the title in a sharp, futuristic sans-serif font with a vibrant neon pink or electric blue outer glow. Add a slight glitch or chromatic aberration effect to the text.'
  },
  {
    id: 'polaroid',
    name: 'Polaroid Grid',
    description: 'Makes each cover look like a separate polaroid.',
    prompt: 'Process this image so each album cover appears to be an individual Polaroid photo with white borders, slightly rotated for a messy, organic feel on a dark tabletop.',
    textInstructions: 'Write the title at the bottom of the image in a casual, black permanent marker handwriting style, as if written on the bottom of a photo frame.'
  }
];

export const AIService = {
  enhanceMosaic: async (base64Image: string, style: AIStyle, title?: string): Promise<string> => {
    const apiKey = useSettingsStore.getState().apiKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY;
    const mockMode = !apiKey || apiKey.startsWith('your_');

    let finalPrompt = style.prompt;
    if (title) {
      finalPrompt += ` Add the text "${title}" to the image. ${style.textInstructions} Ensure the text is clearly legible but integrated into the style.`;
    }

    if (mockMode) {
      console.log("AI Service: Running in MOCK mode with prompt:", finalPrompt);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return base64Image; 
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const base64Data = base64Image.split(',')[1];

    const result = await model.generateContent([
      finalPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      }
    ]);

    await result.response;
    return base64Image; 
  }
};
