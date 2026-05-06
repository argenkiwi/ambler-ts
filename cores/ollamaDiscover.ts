import { tryHost } from "../utils/ollama_discover.ts";

export type Edge = "onDiscovered" | "onCancel";

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

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) => {
  return async (): Promise<[N | null, string]> => {
    utils.print("Searching for Ollama server...");

    for (const host of CANDIDATE_HOSTS) {
      if (await utils.tryHost(host)) {
        utils.print(`Found Ollama server at ${host}`);
        return [edges.onDiscovered, host];
      }
    }

    utils.print("No Ollama server found automatically.");
    const userInput = utils.readLine(
      "Enter Ollama host URL (e.g. http://192.168.1.5:11434): ",
    );
    if (userInput === null) return [edges.onCancel, ""];

    return [edges.onDiscovered, userInput.trim()];
  };
};
