import { NodeFactory } from "../ambler.ts";
import { checkHost, DEFAULT_HOST } from "../utils/ollama_chat.ts";
import { getPrompt } from "../utils/prompt.ts";

export interface State {
  host: string;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  checkHost: (host: string) => Promise<boolean>;
  getPrompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  checkHost,
  getPrompt,
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const host = state.host || DEFAULT_HOST;
    utils.print(`Checking Ollama at ${host}...`);

    const isReachable = await utils.checkHost(host);
    if (isReachable) {
      return [edges.onSuccess, { ...state, host }];
    }

    utils.print(`Ollama not found at ${host}.`);
    const newHost = utils.getPrompt(
      "Enter Ollama host URL (e.g. http://localhost:11434): ",
    );

    if (!newHost) {
      return [edges.onError, state];
    }

    return [edges.onError, { ...state, host: newHost }];
  };
};
