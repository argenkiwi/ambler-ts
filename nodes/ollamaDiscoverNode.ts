import { Edges, next } from "../ambler.ts";
import { tryHost } from "../utils/ollama_discover.ts";

export interface State {
  ollamaHost: string;
}

export type Hook = "onDiscovered" | "onCancel";

export type Utils = {
  tryHost: (host: string) => Promise<boolean>;
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const CANDIDATE_HOSTS = ["http://localhost:11434", "http://127.0.0.1:11434"];

const defaultUtils: Utils = {
  tryHost,
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    utils.print("Searching for Ollama server...");

    for (const host of CANDIDATE_HOSTS) {
      if (await utils.tryHost(host)) {
        utils.print(`Found Ollama server at ${host}`);
        return next(edges.onDiscovered, { ...state, ollamaHost: host });
      }
    }

    utils.print("No Ollama server found automatically.");
    const input = utils.readLine(
      "Enter Ollama host URL (e.g. http://192.168.1.5:11434): ",
    );
    if (input === null) return next(edges.onCancel, state);

    return next(edges.onDiscovered, { ...state, ollamaHost: input.trim() });
  };
}
