import { NodeFactory } from "../ambler.ts";

export interface Input {
  storyPages: string[];
}

export interface Output {
  storyPages: string[];
}

export type Edge = "onDecisionMade" | "onCancel" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) => {
  return (input) => {
    const lastPage = input.storyPages[input.storyPages.length - 1];
    if (!lastPage) return [edges.onError, input];

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
      return [edges.onDecisionMade, input];
    }

    let selectedIdx: number;
    while (true) {
      const userInput = utils.readLine(
        `Select option (1-${options.length}): `,
      );
      if (userInput === null) return [edges.onCancel, input];
      const parsed = parseInt(userInput);
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
      ...input.storyPages.slice(0, -1),
      updatedLastPage,
    ];

    return [edges.onDecisionMade, {
      storyPages: updatedStoryPages,
    }];
  };
};
