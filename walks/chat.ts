import { ambler } from "../ambler.ts";
import { factory as ollamaDiscoverNode } from "../nodes/ollamaDiscoverNode.ts";
import { factory as modelSelectNode } from "../nodes/modelSelectNode.ts";
import { factory as chatPromptNode } from "../nodes/chatPromptNode.ts";
import { factory as chatResponseNode } from "../nodes/chatResponseNode.ts";
import { factory as chatByeNode } from "../nodes/chatByeNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  messages: Array<{ role: string; content: string }>;
}

type NodeId = "start" | "modelSelect" | "prompt" | "response" | "bye";

const step = ambler<State, NodeId>((bind) => ({
  start: bind(ollamaDiscoverNode, {
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: bind(modelSelectNode, { onSelect: "prompt", onCancel: null }),
  prompt: bind(chatPromptNode, { onChat: "response", onQuit: "bye" }),
  response: bind(chatResponseNode, { onPrompt: "prompt" }),
  bye: bind(chatByeNode, { onDone: null }),
}));

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    ollamaHost: "",
    selectedModel: "",
    messages: [],
  };

  while (nodeId) {
    const next = step(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
