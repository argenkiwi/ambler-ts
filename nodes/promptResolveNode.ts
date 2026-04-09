import { Next, Nextable } from "../ambler.ts";

export namespace PromptResolveNode {
  export interface State {
    m3uFilePath: string;
    urls: string[];
  }

  export type Edges<S extends State> = {
    onYes: Nextable<S>;
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
      while (true) {
        const input = await utils.readLine(
          "Some URLs require resolution. Proceed? (y/n)",
        );
        const answer = (input ?? "").toLowerCase().trim();
        if (answer === "y" || answer === "yes") {
          return new Next(edges.onYes, state);
        }
        if (answer === "n" || answer === "no") {
          return null;
        }
        utils.print("Please enter y or n.");
      }
    };
  }
}
