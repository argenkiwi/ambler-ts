import { NodeFactory } from "../ambler.ts";
import { resolveKhinsiderUrl } from "../utils/resolve_khinsider_url.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  resolveKhinsiderUrl: (url: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  resolveKhinsiderUrl,
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  utils.print("Resolving URLs...");
  const resolved = await Promise.all(
    state.urls.map((url) =>
      url.startsWith(KHINSIDER_PREFIX)
        ? utils.resolveKhinsiderUrl(url)
        : Promise.resolve(url)
    ),
  );
  utils.print("URLs resolved.");
  return [edges.onSuccess, { ...state, urls: resolved }];
};
