import { next, Nextable } from "../ambler.ts";
import { resolveKhinsiderUrl } from "../utils/resolve_khinsider_url.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edges<S extends State> = {
  onSuccess: Nextable<S>;
};

export type Utils = {
  resolveKhinsiderUrl: (url: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  resolveKhinsiderUrl,
  print: (msg: string) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    utils.print("Resolving URLs...");
    const resolved = await Promise.all(
      state.urls.map((url) =>
        url.startsWith(KHINSIDER_PREFIX)
          ? utils.resolveKhinsiderUrl(url)
          : Promise.resolve(url)
      ),
    );
    utils.print("URLs resolved.");
    return next(edges.onSuccess, { ...state, urls: resolved });
  };
}
