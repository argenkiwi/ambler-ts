import { next } from "../ambler.ts";
import { generateStory } from "../utils/solar_generate.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

export type Edges<S extends State> = {
  onGenerateComplete: string | null;
  onError: string | null;
};

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

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
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

      return next(edges.onGenerateComplete, {
        ...state,
        generatedStory: story,
      });
    } catch (error) {
      utils.print(`Error generating story: ${error}`);
      return next(edges.onError, state);
    }
  };
}
