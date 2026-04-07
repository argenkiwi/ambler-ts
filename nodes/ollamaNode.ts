import { Next, Nextable } from "../ambler.ts";

export namespace OllamaNode {
  export interface Message {
    role: "user" | "assistant";
    content: string;
  }

  export interface State {
    messages: Message[];
  }

  export type Edges<S extends State> = {
    onResponse: Nextable<S>;
  };

  export type Utils = {
    print: (msg: string) => void;
    fetch: typeof fetch;
  };

  const defaultUtils: Utils = {
    print: (msg: string) => console.log(msg),
    fetch: fetch,
  };

  export function create<S extends State>(
    edges: Edges<S>,
    utils: Utils = defaultUtils,
    model = "llama3",
  ): Nextable<S> {
    return async (state: S): Promise<Next<S> | null> => {
      utils.print("AI is thinking...");
      
      try {
        const response = await utils.fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model,
            messages: state.messages,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage: Message = data.message;
        
        utils.print(`AI: ${assistantMessage.content}`);

        return new Next(edges.onResponse, {
          ...state,
          messages: [...state.messages, assistantMessage],
        });
      } catch (error) {
        utils.print(`Error connecting to Ollama: ${error instanceof Error ? error.message : "Unknown error"}`);
        // Return to prompt even on error
        return new Next(edges.onResponse, state);
      }
    };
  }
}
