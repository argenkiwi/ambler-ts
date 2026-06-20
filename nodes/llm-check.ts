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
    const defaultHosts = ["http://localhost:11434/v1", "http://localhost:1234/v1"];
    const hostsToTry = state.host ? [state.host] : defaultHosts;

    for (const host of hostsToTry) {
      utils.print(`Checking LLM at ${host}...`);
      if (await utils.checkHost(host)) {
        return [edges.onSuccess, { ...state, host }];
      }
    }

    const errorMsg = state.host
      ? `LLM not found at ${state.host}.`
      : "No LLM found at default ports (11434 or 1234).";

    utils.print(errorMsg);
    const newHost = utils.getPrompt(
      "Enter LLM host URL (e.g. http://localhost:11434/v1 or http://localhost:1234/v1): ",
    );

    if (!newHost) {
      return [edges.onError, state];
    }

    return [edges.onError, { ...state, host: newHost }];
  };
};
