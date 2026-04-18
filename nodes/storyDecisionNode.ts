import { next, Nextable, defaultPrint, defaultReadLine } from "../ambler.ts";

export interface State {
  selectedModel: string;
  ollamaHost: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
  currentPage: number;
}

export type Edges<S extends State> = {
  onDecisionMade: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: defaultReadLine,
  print: defaultPrint,
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
): Nextable<S> {
  return async (state: S) => {
    const lastPage = state.storyPages[state.storyPages.length - 1];
    if (!lastPage) return null;

    // Extract the checkboxes from the last page
    const lines = lastPage.split("\n");
    const checkboxLines: number[] = [];
    const options: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(". [ ]")) {
        checkboxLines.push(i);
        options.push(lines[i]);
      }
    }

    if (options.length === 0) {
      // Fallback if no checkboxes found (safety)
      return next(edges.onDecisionMade, state);
    }

    let selectedIdx: number;
    while (true) {
      const input = await utils.readLine(
        `Select option (1-${options.length}): `,
      );
      if (input === null) return null;
      const parsed = parseInt(input);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= options.length) {
        selectedIdx = parsed;
        break;
      }
      utils.print("Invalid selection. Please try again.");
    }

    // Update the last page in the state
    const updatedLines = [...lines];
    const lineIndexInLines = checkboxLines[selectedIdx - 1];
    updatedLines[lineIndexInLines] = lines[lineIndexInLines].replace(
      ". [ ]",
      ". [x]",
    );

    const updatedLastPage = updatedLines.join("\n");
    const updatedStoryPages = [
      ...state.storyPages.slice(0, -1),
      updatedLastPage,
    ];

    return next(edges.onDecisionMade, {
      ...state,
      storyPages: updatedStoryPages,
    });
  };
}
