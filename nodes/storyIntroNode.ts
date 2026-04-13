import { Next, Nextable } from "../ambler.ts";

export namespace StoryIntroNode {
  export interface State {
    identity: string;
    placement: string;
    circumstances: string;
  }

  export type Edges<S extends State> = {
    onIntroComplete: Nextable<S>;
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
      const identity = await utils.readLine("Who is the protagonist? ");
      const placement = await utils.readLine("Where and when does the story take place? ");
      const circumstances = await utils.readLine("What is happening? ");

      if (identity === null || placement === null || circumstances === null) {
        return null;
      }

      return new Next(edges.onIntroComplete, {
        ...state,
        identity: identity.trim(),
        placement: placement.trim(),
        circumstances: circumstances.trim(),
      });
    };
  }
}
