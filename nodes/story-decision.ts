import { NodeFactory } from "../ambler.ts";
import { getPrompt } from "../utils/prompt.ts";

export interface State {
  story_pages: string[];
}

export type Edge = "onSelect" | "onCancel";

export type Utils = {
  getPrompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  getPrompt,
  print: (msg) => console.log(msg),
};

function extractOptions(page: string): RegExpMatchArray | null {
  const checkboxRegex = /- \[ \] \d+\./g;
  const matches = page.match(checkboxRegex);
  return matches && matches.length > 0 ? matches : null;
}

function markChoice(page: string, optionNumber: number): string {
  // Match the specific option number and mark it
  return page.replace(
    new RegExp(`- \\[ \\] (${optionNumber}\\.\\s[\\s\\S]*?)(?=\\n|$)`),
    `- [x] $1`,
  );
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const lastPage = state.story_pages[state.story_pages.length - 1];
    if (!lastPage) {
      // No pages yet, just continue to next page
      return [edges.onSelect, state];
    }

    const options = extractOptions(lastPage);

    // If there are no checkbox options in the last page, just continue generating
    if (!options || options.length === 0) {
      return [edges.onSelect, state];
    }

    // Extract option numbers from the matches
    const optionNumbers: number[] = [];
    for (const opt of options) {
      const numMatch = opt.match(/\d+/);
      if (numMatch) {
        optionNumbers.push(parseInt(numMatch[0], 10));
      }
    }

    if (optionNumbers.length === 0) {
      return [edges.onSelect, state];
    }

    // Display options to the user
    utils.print("Choose the next path:");
    for (const opt of options) {
      utils.print(`  ${opt}`);
    }

    let choice: string | null;
    do {
      choice = utils.getPrompt(
        `Enter option number (${optionNumbers.join(", ")}) or leave blank to continue: `,
      );
      if (choice === null) {
        return [edges.onCancel, state];
      }

      if (choice === "") {
        // User pressed Enter without entering a number, continue generating
        return [edges.onSelect, state];
      }

      const num = parseInt(choice, 10);
      if (!isNaN(num) && optionNumbers.includes(num)) {
        // Mark the chosen checkbox as selected
        const updatedLastPage = markChoice(lastPage, num);
        return [
          edges.onSelect,
          {
            ...state,
            story_pages: [
              ...state.story_pages.slice(0, -1),
              updatedLastPage,
            ],
          },
        ];
      }

      utils.print(`Invalid choice. Please enter one of: ${optionNumbers.join(", ")}`);
    } while (true);
  };
};
