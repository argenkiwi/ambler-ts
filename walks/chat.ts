import { amble, Node } from "../ambler.ts";
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

type NodeId = "start" | "modelSelect" | "prompt" | "response" | "bye";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: OllamaDiscoverNode.create({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: ModelSelectNode.create({ onSelect: "prompt", onCancel: null }),
  prompt: ChatPromptNode.create({ onChat: "response", onQuit: "bye" }),
  response: ChatResponseNode.create({ onPrompt: "prompt" }),
  bye: ChatByeNode.create<State, NodeId>({ onDone: null }),
};

const initialNodeId: NodeId = "start";
const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  messages: [],
};

if (import.meta.main) {
  await amble(nodes, initialNodeId, initialState);
}
