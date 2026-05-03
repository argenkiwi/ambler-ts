import { ambler } from "../ambler.ts";
import ollamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import modelSelectNode from "../nodes/modelSelectNode.ts";
import chatPromptNode from "../nodes/chatPromptNode.ts";
import chatResponseNode from "../nodes/chatResponseNode.ts";
import chatByeNode from "../nodes/chatByeNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  messages: Array<{ role: string; content: string }>;
}

type NodeId = "start" | "modelSelect" | "prompt" | "response" | "bye";

const amble = ambler<State, NodeId>((bind) => ({
  start: bind(ollamaDiscoverNode, { onDiscovered: "modelSelect", onCancel: null }),
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
    const next = amble(nodeId, state);
    [nodeId, state] = typeof next === 'function' ? next : await next;
  }
}
