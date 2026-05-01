import { NodeFactory } from "../ambler.ts";
import { generateStory } from "../utils/solar_generate.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

export type Edge = "onGenerateComplete" | "onError";

export type Utils = {
  generateStory: (
    host: string,
    model: string,
    prompt: string,
  ) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  generateStory,
  print: (msg) => console.log(msg),
};

export const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    utils.print(
      "\nGenerating your solarpunk story... (this may take a moment)",
    );
    try {
      const story = await utils.generateStory(
        state.ollamaHost,
        state.selectedModel,
        state.solarPrompt,
      );

      utils.print("\n--- GENERATED STORY ---");
      utils.print(story);
      utils.print("\n--- END OF STORY ---");

      return [edges.onGenerateComplete, {
        ...state,
        generatedStory: story,
      }];
    } catch (error) {
      utils.print(`Error generating story: ${error}`);
      return [edges.onError, state];
    }
  };
};
