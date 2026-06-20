import { NodeFactory } from "../ambler.ts";
import { checkHost } from "../utils/llm_chat.ts";
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
    const host = state.host || "http://localhost:11434/v1";
    utils.print(`Checking LLM at ${host}...`);

    const isReachable = await utils.checkHost(host);
    if (isReachable) {
      return [edges.onSuccess, { ...state, host }];
    }

    utils.print(`LLM not found at ${host}.`);
    const newHost = utils.getPrompt(
      "Enter LLM host URL (e.g. http://localhost:11434/v1): ",
    );

    if (!newHost) {
      return [edges.onError, state];
    }

    return [edges.onError, { ...state, host: newHost }];
  };
};
