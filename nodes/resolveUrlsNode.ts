import { Next, Nextable } from "../ambler.ts";
import { resolveKhinsiderUrl } from "../utils/resolve_khinsider_url.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export namespace ResolveUrlsNode {
  export interface State {
    urls: string[];
  }

  export type Edges<S extends State> = {
    onDone: Nextable<S>;
  };

  export type Utils = {
    resolveUrl: (url: string) => Promise<string>;
  };

  const defaultUtils: Utils = {
    resolveUrl: resolveKhinsiderUrl,
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const resolved = await Promise.all(
        state.urls.map((url) =>
          url.startsWith(KHINSIDER_PREFIX) ? utils.resolveUrl(url) : Promise.resolve(url)
        ),
      );
      return new Next(edges.onDone, { ...state, urls: resolved });
    };
  }
}
