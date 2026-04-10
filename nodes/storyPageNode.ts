import { Next, Nextable } from "../ambler.ts";
import { Ollama } from 'npm:ollama'

export namespace StoryPageNode {
  export interface State {
    selectedModel: string;
    identity: string;
    placement: string;
    circumstances: string;
    storyPages: string[];
  }

  export type Edges<S extends State> = {
    onPageComplete: Nextable<S>;
    onDecisionRequired: Nextable<S>;
  };

  export type Utils = {
    chat: (model: string, messages: { role: string; content: string }[]) => Promise<string>;
    readLine: (msg: string) => Promise<string | null>;
    print: (msg: string) => void;
  };

  const defaultUtils: Utils = {
    chat: async (model, messages) => {
      const ollama = new Ollama({ host: 'http://192.168.1.5:11434' })
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
      const prompt = `Write a page (max 250 words) of a CYOA story. 
      Context:
      Protagonist: ${state.identity}
      Setting: ${state.placement}
      Circumstance: ${state.circumstances}
      Previous story content: ${state.storyPages.join("\n\n")}

      Rules:
      - Continue the story.
      - Use second person singular.
      - Decide wheter the story should end or continue, increasing the likelyhood of it ending by 10% for each new page.
      - If the story ends, the final line must be "The End".
      - If the story continues, the final two lines must be two markdown checkboxes representing actions the protagonist can take (e.g., "- [ ] Option 1\n- [ ] Option 2").
      - Do not include any other text outside the story and the options/end marker.`;

      const messages = [
        { role: "user", content: prompt }
      ];

      const reply = await utils.chat(state.selectedModel, messages);
      const newPage = reply.trim();
      const updatedStoryPages = [...state.storyPages, newPage];
      const fullStory = updatedStoryPages.join("\n\n");
      
      utils.print(`\n--- New Page ---\n${newPage}\n---------------`);

      if (fullStory.trim().endsWith("The End")) {
        return new Next(edges.onPageComplete, { ...state, storyPages: updatedStoryPages });
      } else {
        return new Next(edges.onDecisionRequired, { ...state, storyPages: updatedStoryPages });
      }
    };
  }
}
