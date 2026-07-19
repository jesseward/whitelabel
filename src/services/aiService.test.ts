import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  AIService,
  buildEnhancePrompt,
  AI_STYLES,
  FONT_OPTIONS,
  LAYOUT_OPTIONS,
} from "./aiService";
import { useSettingsStore } from "../store/useSettingsStore";

describe("AIService", () => {
  const vintageStyle = AI_STYLES.find((s) => s.id === "vintage")!;
  const rawMixtapeStyle = AI_STYLES.find((s) => s.id === "mixtape_raw")!;

  describe("buildEnhancePrompt", () => {
    it("should return base prompt when only style is provided", () => {
      const prompt = buildEnhancePrompt(vintageStyle);
      expect(prompt).toBe(vintageStyle.prompt);
    });

    it("should append layout instruction", () => {
      const layout = LAYOUT_OPTIONS[0]; // Top Header Strip
      const prompt = buildEnhancePrompt(vintageStyle, { layout });
      expect(prompt).toContain(vintageStyle.prompt);
      expect(prompt).toContain(layout.instruction);
    });

    it("should append title with style text instructions", () => {
      const title = "My Awesome Mix";
      const prompt = buildEnhancePrompt(vintageStyle, { title });
      expect(prompt).toContain(vintageStyle.prompt);
      expect(prompt).toContain(
        `Add the following text elements to the image: title: "${title}"`,
      );
      expect(prompt).toContain(vintageStyle.textInstructions);
      expect(prompt).toContain(
        "Ensure all provided text is clearly legible, integrated naturally into the design",
      );
      expect(prompt).toContain(
        "CRITICAL: Do NOT add any text, words, or labels to the image other than the exact values provided.",
      );
    });

    it("should use font option instruction if provided", () => {
      const title = "My Awesome Mix";
      const font = FONT_OPTIONS[0]; // Jungle
      const prompt = buildEnhancePrompt(vintageStyle, {
        title,
        fontStyle: font,
      });
      expect(prompt).toContain(vintageStyle.prompt);
      expect(prompt).toContain(font.instruction);
      expect(prompt).not.toContain(vintageStyle.textInstructions);
    });

    it("should adjust placement instruction if layout is provided with title", () => {
      const title = "My Awesome Mix";
      const layout = LAYOUT_OPTIONS[0]; // Top Header Strip
      const prompt = buildEnhancePrompt(vintageStyle, { title, layout });
      expect(prompt).toContain(
        `Place the primary text INSIDE the strip created above.`,
      );
    });

    it("should include DJ and extra text in prompt if provided", () => {
      const title = "My Awesome Mix";
      const dj = "DJ Shadow";
      const extra = "Side A";
      const prompt = buildEnhancePrompt(vintageStyle, { title, dj, extra });
      expect(prompt).toContain(`title: "${title}"`);
      expect(prompt).toContain(`artist/DJ name: "${dj}"`);
      expect(prompt).toContain(`additional info: "${extra}"`);
    });
  });

  describe("enhanceMosaic (Mock Mode)", () => {
    beforeEach(() => {
      // Mock Canvas getContext to avoid JSDOM "Not implemented" error
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        fillRect: () => {},
        beginPath: () => {},
        roundRect: () => {},
        fill: () => {},
        stroke: () => {},
        arc: () => {},
        moveTo: () => {},
        lineTo: () => {},
        ellipse: () => {},
        fillText: () => {},
        // Properties used in createMockCassette
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 0,
        font: "",
        textAlign: "",
        textBaseline: "",
      } as unknown as CanvasRenderingContext2D);

      // Mock toDataURL to return a dummy image data URL
      vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
        "data:image/png;base64,mocked_cassette",
      );

      // Ensure we are in mock mode by clearing API key in store
      useSettingsStore.setState({
        apiKeys: { gemini: "", lastfm: "", discogs: "" },
      });
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("should return the input image for standard styles in mock mode", async () => {
      const inputImage = "data:image/png;base64,original_data";
      const promise = AIService.enhanceMosaic(inputImage, vintageStyle);

      vi.runAllTimers();

      const result = await promise;
      expect(result).toBe(inputImage);
    });

    it("should return a generated mock cassette image for mixtape styles in mock mode", async () => {
      const inputImage = "data:image/png;base64,placeholder_data";
      const promise = AIService.enhanceMosaic(inputImage, rawMixtapeStyle, {
        title: "Test Mix",
        dj: "Test DJ",
        extra: "Test Extra",
      });

      vi.runAllTimers();

      const result = await promise;
      expect(result).toBeTypeOf("string");
      expect(result).toBe("data:image/png;base64,mocked_cassette");
      expect(result).not.toBe(inputImage);
    });
  });
});
