import { Next, Nextable } from "../ambler.ts";
import { Ollama } from "npm:ollama";

export namespace StoryPageNode {
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
    onPageComplete: Nextable<S>;
    onDecisionRequired: Nextable<S>;
  };

  export type Utils = {
    chat: (
      host: string,
      model: string,
      messages: { role: string; content: string }[],
    ) => Promise<string>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    chat: async (host, model, messages) => {
      const ollama = new Ollama({ host });
      const response = await ollama.chat({ model, messages });
      return response.message.content;
    },
    readLine: async (msg: string) => prompt(msg),
    print: (msg: string) => console.log(msg),
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      const prompt = `Write a page (max 280 characters) of a CYOA story. 
      Context:
      Protagonist: ${state.identity}
      Setting: ${state.placement}
      Circumstance: ${state.circumstances}
      Previous story content: ${state.storyPages.join("\n\n")}

      Rules:
      - Use second person singular.
      - Decide wheter the story should end or continue (chance of ending is ${state.currentPage} in 10).
      - If the story ends, the final line must be "The End".
      - If the story continues, the final lines must be a numbered list of markdown checkboxes representing 2 or 3 actions the protagonist can choose from (e.g., "1. [ ] Option 1\n2. [ ] Option 2").
      - Do not include any other text outside the story and the options/end marker.`;

      const messages = [
        { role: "user", content: prompt },
      ];

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
        return new Next(edges.onPageComplete, {
          ...state,
          storyPages: updatedStoryPages,
          currentPage: state.currentPage + 1,
        });
      } else {
        return new Next(edges.onDecisionRequired, {
          ...state,
          storyPages: updatedStoryPages,
          currentPage: state.currentPage + 1,
        });
      }
    };
  }
}
