import { amble, node, Nextable } from "../ambler.ts";
import { PromptNode } from "../nodes/promptNode.ts";
import { OllamaNode } from "../nodes/ollamaNode.ts";
import { ExitNode } from "../nodes/exitNode.ts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface State {
  messages: Message[];
}

const initialState: State = {
  messages: [],
};

// Wire the graph using a record to store node factories
const nodes: Record<string, Nextable<State>> = {
  prompt: node(() => PromptNode.create({ 
    onInput: nodes.ollama, 
    onExit: nodes.exit 
  })),
  ollama: node(() => OllamaNode.create({ 
    onResponse: nodes.prompt 
  })),
  exit: node(() => ExitNode.create()),
};

if (import.meta.main) {
  console.log("Welcome to the Ambler Chat! Type 'bye', 'quit', or 'exit' to end.");
  await amble(nodes.prompt, initialState);
}
