import { NodeFactory } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";

export interface Input {
  selectedModel: string;
  ollamaHost: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
  currentPage: number;
}

export interface Output {
  storyPages: string[];
  currentPage: number;
}

export type Edge = "onPageComplete" | "onDecisionRequired" | "onError";

export type Utils = {
  chat: (
    host: string,
    model: string,
    messages: { role: string; content: string }[],
  ) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: ollamaChat,
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) => {
  return async (input) => {
    const prompt = `Write a page (max 280 characters) of a CYOA story.
      Context:
      Protagonist: ${input.identity}
      Setting: ${input.placement}
      Circumstance: ${input.circumstances}
      Previous story content: ${input.storyPages.join("\n\n")}

      Rules:
      - Use second person singular.
      - Decide whether the story should end or continue (chance of ending is ${input.currentPage} in 10).
      - If the story ends, the final line must be "The End".
      - If the story continues, the final lines must be a numbered list of markdown checkboxes representing 2 or 3 actions the protagonist can choose from (e.g., "1. [ ] Option 1\n2. [ ] Option 2").
      - Do not include any other text outside the story and the options/end marker.`;

    const messages = [{ role: "user", content: prompt }];
    try {
      const reply = await utils.chat(
        input.ollamaHost,
        input.selectedModel,
        messages,
      );

      const newPage = reply.trim();
      const updatedStoryPages = [...input.storyPages, newPage];
      const fullStory = updatedStoryPages.join("\n\n");
      utils.print(
        `\n--- Page ${input.currentPage} ---\n${newPage}\n---------------`,
      );

      if (fullStory.trim().endsWith("The End")) {
        return [edges.onPageComplete, {
          storyPages: updatedStoryPages,
          currentPage: input.currentPage + 1,
        }];
      } else {
        return [edges.onDecisionRequired, {
          storyPages: updatedStoryPages,
          currentPage: input.currentPage + 1,
        }];
      }
    } catch (error) {
      utils.print(`Error generating page: ${error}`);
      return [edges.onError, {
        storyPages: input.storyPages,
        currentPage: input.currentPage,
      }];
    }
  };
};
