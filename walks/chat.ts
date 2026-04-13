import { amble, node, Nextable } from "../ambler.ts";
import { OllamaDiscoverNode } from "../nodes/ollamaDiscoverNode.ts";
import { ModelSelectNode } from "../nodes/modelSelectNode.ts";
import { ChatPromptNode } from "../nodes/chatPromptNode.ts";
import { ChatResponseNode } from "../nodes/chatResponseNode.ts";
import { ChatByeNode } from "../nodes/chatByeNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  messages: Array<{ role: string; content: string }>;
}

const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  messages: [],
};

const nodes: Record<string, Nextable<State>> = {
  start: node(() => OllamaDiscoverNode.create({ onDiscovered: nodes.modelSelect })),
  modelSelect: node(() => ModelSelectNode.create({ onSelect: nodes.prompt })),
  prompt: node(() => ChatPromptNode.create({ onChat: nodes.response, onQuit: nodes.bye })),
  response: node(() => ChatResponseNode.create({ onPrompt: nodes.prompt })),
  bye: node(() => ChatByeNode.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
