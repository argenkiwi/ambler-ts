import { NodeFactory } from "../ambler.ts";

export interface State {
  m3uFilePath: string;
  urls: string[];
}

export type Edge = "onSuccess";

export type Utils = {
  writeFile: (path: string, content: string) => Promise<void>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  writeFile: (path: string, content: string) =>
    Deno.writeTextFile(path, content),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const content = state.urls.join("\n");
  await utils.writeFile(state.m3uFilePath, content);
  utils.print(`Saved: ${state.m3uFilePath}`);
  state.urls.forEach((url) => utils.print(`  ${url}`));
  return [edges.onSuccess, state];
};
