import { next, Nextable, defaultPrint, defaultReadLine } from "../ambler.ts";

export interface State {
  ollamaHost: string;
}

export type Edges<S extends State> = {
  onDiscovered: Nextable<S>;
};

export type Utils = {
  tryHost: (host: string) => Promise<boolean>;
  readLine: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const CANDIDATE_HOSTS = [
  "http://localhost:11434",
  "http://127.0.0.1:11434",
];

const defaultUtils: Utils = {
  tryHost: async (host: string) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${host}/api/version`, { signal: controller.signal });
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  },
  readLine: defaultReadLine,
  print: defaultPrint,
};

export const create = <S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Nextable<S> =>
async (state: S) => {
  utils.print("Searching for Ollama server...");

  for (const host of CANDIDATE_HOSTS) {
    if (await utils.tryHost(host)) {
      utils.print(`Found Ollama server at ${host}`);
      return next(edges.onDiscovered, { ...state, ollamaHost: host });
    }
  }

  utils.print("No Ollama server found automatically.");
  const input = await utils.readLine("Enter Ollama host URL (e.g. http://192.168.1.5:11434): ");
  if (input === null) return null;

  return next(edges.onDiscovered, { ...state, ollamaHost: input.trim() });
};
