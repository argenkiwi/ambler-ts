import { Edges, next } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";

export interface State {
  selectedModel: string;
  ollamaHost: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
  currentPage: number;
}

export type Hook = "onPageComplete" | "onDecisionRequired" | "onError";

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

export function create<S extends State, K extends string = string>(
  edges: Edges<Hook, K>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const prompt = `Write a page (max 280 characters) of a CYOA story.
      Context:
      Protagonist: ${state.identity}
      Setting: ${state.placement}
      Circumstance: ${state.circumstances}
      Previous story content: ${state.storyPages.join("\n\n")}

      Rules:
      - Use second person singular.
      - Decide whether the story should end or continue (chance of ending is ${state.currentPage} in 10).
      - If the story ends, the final line must be "The End".
      - If the story continues, the final lines must be a numbered list of markdown checkboxes representing 2 or 3 actions the protagonist can choose from (e.g., "1. [ ] Option 1\n2. [ ] Option 2").
      - Do not include any other text outside the story and the options/end marker.`;

    const messages = [{ role: "user", content: prompt }];
    try {
      const reply = await utils.chat(
        state.ollamaHost,
        state.selectedModel,
        messages,
      );

      const newPage = reply.trim();
      const updatedStoryPages = [...state.storyPages, newPage];
      const fullStory = updatedStoryPages.join("\n\n");
      utils.print(
        `\n--- Page ${state.currentPage} ---\n${newPage}\n---------------`,
      );

      if (fullStory.trim().endsWith("The End")) {
        return next(edges.onPageComplete, {
          ...state,
          storyPages: updatedStoryPages,
          currentPage: state.currentPage + 1,
        });
      } else {
        return next(edges.onDecisionRequired, {
          ...state,
          storyPages: updatedStoryPages,
          currentPage: state.currentPage + 1,
        });
      }
    } catch (error) {
      utils.print(`Error generating page: ${error}`);
      return next(edges.onError, state);
    }
  };
}
