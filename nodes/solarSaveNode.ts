import { Next, Nextable } from "../ambler.ts";

export namespace SolarSaveNode {
  export interface State {
    generatedStory: string;
  }

  export type Edges<S extends State> = {
    onSaveComplete: (state: S) => void;
  };

  export type Utils = {
    saveToFile: (content: string) => Promise<boolean>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    saveToFile: async (content) => {
      const filename = `story-${Date.now()}.md`;
      try {
        await Deno.writeTextFile(filename, content);
        console.log(`Saved to ${filename}`);
        return true;
      } catch (e) {
        console.error(`Failed to save: ${e}`);
        return false;
      }
    },
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const input = await utils.readLine("Would you like to save this story? (y/n): ");
      if (input?.toLowerCase() === "y") {
        const success = await utils.saveToFile(state.generatedStory);
        if (!success) {
          utils.print("Failed to save the story.");
        }
      } else {
        utils.print("Story not saved.");
      }

      edges.onSaveComplete(state);
      return null;
    };
  }
}
