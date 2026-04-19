import { amble, Nextable, node } from "../ambler.ts";
import * as OllamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import * as ModelSelectNode from "../nodes/modelSelectNode.ts";
import * as ChatPromptNode from "../nodes/chatPromptNode.ts";
import * as ChatResponseNode from "../nodes/chatResponseNode.ts";
import * as ChatByeNode from "../nodes/chatByeNode.ts";

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
  start: node(() =>
    OllamaDiscoverNode.create({ onDiscovered: nodes.modelSelect }),
  ),
  modelSelect: node(() => ModelSelectNode.create({ onSelect: nodes.prompt })),
  prompt: node(() =>
    ChatPromptNode.create({ onChat: nodes.response, onQuit: nodes.bye }),
  ),
  response: node(() => ChatResponseNode.create({ onPrompt: nodes.prompt })),
  bye: node(() => ChatByeNode.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
