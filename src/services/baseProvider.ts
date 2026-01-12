import type {
  SearchProvider,
  SearchParams,
  SearchResult,
  Provider,
} from "../types";

/**
 * Base class for all music database providers to reduce boilerplate.
 */
export abstract class BaseProvider implements SearchProvider {
  abstract name: Provider;
  abstract rateLimit: { limit: number; interval: number };
  protected abstract baseUrl: string;

  /**
   * Universal fetch wrapper with basic error handling and User-Agent
   */
  protected async fetchJson<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "User-Agent":
          "WhiteLabelApp/1.0 (https://github.com/your-repo/whitelabel)",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `${this.name} API error: ${response.statusText} (${response.status})`,
      );
    }

    return response.json();
  }

  abstract search(params: SearchParams, page?: number): Promise<SearchResult>;
}
