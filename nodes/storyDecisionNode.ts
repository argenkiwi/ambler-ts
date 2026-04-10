import { Next, Nextable } from "../ambler.ts";

export namespace StoryDecisionNode {
  export interface State {
    selectedModel: string;
    identity: string;
    placement: string;
    circumstances: string;
    storyPages: string[];
  }

  export type Edges<S extends State> = {
    onDecisionMade: Nextable<S>;
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
      const lastPage = state.storyPages[state.storyPages.length - 1];
      if (!lastPage) return null;

      // Extract the checkboxes from the last page
      const lines = lastPage.split("\n");
      const checkboxLines: number[] = [];
      const options: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("- [ ]")) {
          checkboxLines.push(i);
          options.push(lines[i]);
        }
      }

      if (options.length === 0) {
        // Fallback if no checkboxes found (safety)
        return new Next(edges.onDecisionMade, state);
      }

      utils.print("\nChoose an option:");
      options.forEach((opt, idx) => utils.print(`${idx}: ${opt}`));

      const input = await utils.readLine("Select option index: ");
      if (input === null) return null;

      const selectedIdx = parseInt(input);
      if (isNaN(selectedIdx) || selectedIdx < 0 || selectedIdx >= options.length) {
        utils.print("Invalid selection. Please try again.");
        return new Next(edges.onDecisionMade, state); // This will loop back to current node if wired correctly
      }

      // Update the last page in the state
      const updatedLines = [...lines];
      const lineIndexInLines = checkboxLines[selectedIdx];
      updatedLines[lineIndexInLines] = lines[lineIndexInLines].replace("- [ ]", "- [x]");

      const updatedLastPage = updatedLines.join("\n");
      const updatedStoryPages = [...state.storyPages.slice(0, -1), updatedLastPage];

      return new Next(edges.onDecisionMade, { ...state, storyPages: updatedStoryPages });
    };
  }
}
