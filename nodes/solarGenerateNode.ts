import { Ollama } from "ollama";
import { MaybePromise, next, Nextable } from "../ambler.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

export type Edges<S extends State> = {
  onGenerateComplete: Nextable<S>;
};

export type Utils = {
  generateStory: (
    host: string,
    model: string,
    prompt: string,
  ) => MaybePromise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  generateStory: async (host, model, prompt) => {
    const ollama = new Ollama({ host });
    const systemPrompt =
      `You are an expert narrative engine specialized in the Solarpunk genre. Your task is to take a given "Solar Prompt" and transform it into a richly detailed, emotionally resonant short story that adheres strictly to the core tenets of the Solarpunk movement.

**INPUT:** ${prompt}

**OUTPUT REQUIREMENTS:**
1. **Length:** Approximately 1000–1500 words.
2. **Tone:** Hopeful, resourceful, and slightly melancholy.
3. **Focus:** Sensory detail (smell of clean rain, sound of wind through bio-domes, taste of homegrown food).

**SOLARPUNK NARRATIVE GUIDELINES:**
1. **Community as Protagonist:** Avoid "Chosen One". Focus on teams, neighborhoods, collectives. Success through compromise and collective labor.
2. **Infrastructure is Sexy:** Show the systems (solar power, vertical farms, wastewater). Show the strain/maintenance.
3. **Human/Environmental Harmony:** Conflict should be socio-political or resource-based, not Man vs. Nature. Resolution must demonstrate ingenuity working *with* nature.

**CONCLUSION:**
Conclude with a brief, reflective epilogue (200 words) showing the ongoing reality after the crisis.
`;
    const response = await ollama.generate({
      model,
      prompt: systemPrompt,
    });
    return response.response;
  },
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
      return null;
    }
  };
}
