import { NodeFactory } from "../ambler.ts";
import { generateStory } from "../utils/solar_generate.ts";

export interface Input {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
}

export interface Output {
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

export const factory: NodeFactory<Edge, Utils, Input, Output> = (
  edges,
  utils = defaultUtils,
) => {
  return async (input) => {
    utils.print(
      "\nGenerating your solarpunk story... (this may take a moment)",
    );
    try {
      const story = await utils.generateStory(
        input.ollamaHost,
        input.selectedModel,
        input.solarPrompt,
      );

      utils.print("\n--- GENERATED STORY ---");
      utils.print(story);
      utils.print("\n--- END OF STORY ---");

      return [edges.onGenerateComplete, {
        generatedStory: story,
      }];
    } catch (error) {
      utils.print(`Error generating story: ${error}`);
      return [edges.onError, { generatedStory: "" }];
    }
  };
};
