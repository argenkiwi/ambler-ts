import { Next, Nextable } from "../ambler.ts";

const KHINSIDER_PREFIX = "https://downloads.khinsider.com/game-soundtracks";

export namespace PromptOptionsNode {
  export interface State {
    filePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onList: Nextable<S>;
    onResolve: Nextable<S>;
    onDownload: Nextable<S>;
  };

  export type Utils = {
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const hasKhinsider = state.urls.some((url) => url.startsWith(KHINSIDER_PREFIX));

      const options: Array<{ label: string; edge: Nextable<S> | null }> = [
        { label: "list", edge: edges.onList },
        hasKhinsider
          ? { label: "resolve", edge: edges.onResolve }
          : { label: "download", edge: edges.onDownload },
        { label: "quit", edge: null },
      ];

      while (true) {
        options.forEach((opt, i) => utils.print(`${i + 1}. ${opt.label}`));
        const input = await utils.readLine("Select an option: ");
        const choice = parseInt(input ?? "");

        if (!isNaN(choice) && choice >= 1 && choice <= options.length) {
          const selected = options[choice - 1];
          if (selected.edge === null) return null;
          return new Next(selected.edge, state);
        }
      }
    };
  }
}
