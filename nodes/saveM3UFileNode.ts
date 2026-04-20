import { next, Nextable } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edges<S extends State> = {
  onSuccess: Nextable<S>;
};

export type Utils = {
  writeFile: (path: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  writeFile: (path: string, content: string) =>
    Deno.writeTextFile(path, content),
  print: (msg: string) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const content = state.urls.join("\n");
    await utils.writeFile(state.m3uFilePath, content);
    utils.print(`Saved: ${state.m3uFilePath}`);
    state.urls.forEach((url) => utils.print(`  ${url}`));
    return next(edges.onSuccess, state);
  };
}
