import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./useSettingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      enabledProviders: {
        lastfm: true,
        discogs: true,
        musicbrainz: true,
        itunes: true,
        mock: false,
      },
      apiKeys: {
        lastfm: "",
        discogs: "",
        gemini: "",
      },
    });
  });

  it("should initialize with default values", () => {
    const state = useSettingsStore.getState();
    expect(state.enabledProviders.lastfm).toBe(true);
    expect(state.apiKeys.lastfm).toBe("");
  });

  it("should toggle providers", () => {
    const store = useSettingsStore.getState();
    expect(store.enabledProviders.lastfm).toBe(true);

    store.toggleProvider("lastfm");

    expect(useSettingsStore.getState().enabledProviders.lastfm).toBe(false);

    store.toggleProvider("lastfm");
    expect(useSettingsStore.getState().enabledProviders.lastfm).toBe(true);
  });

  it("should set API keys", () => {
    const store = useSettingsStore.getState();
    expect(store.apiKeys.lastfm).toBe("");

    store.setApiKey("lastfm", "test-key-123");

    expect(useSettingsStore.getState().apiKeys.lastfm).toBe("test-key-123");
  });

  it("should update multiple keys independently", () => {
    const store = useSettingsStore.getState();

    store.setApiKey("lastfm", "key1");
    store.setApiKey("discogs", "key2");

    const state = useSettingsStore.getState();
    expect(state.apiKeys.lastfm).toBe("key1");
    expect(state.apiKeys.discogs).toBe("key2");
    expect(state.apiKeys.gemini).toBe("");
  });
});
