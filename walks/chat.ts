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

const amble = ambler({
  start: ollamaDiscoverNode<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: modelSelectNode<State, NodeId>({ onSelect: "prompt", onCancel: null }),
  prompt: chatPromptNode<State, NodeId>({ onChat: "response", onQuit: "bye" }),
  response: chatResponseNode<State, NodeId>({ onPrompt: "prompt" }),
  bye: chatByeNode<State, NodeId>({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    ollamaHost: "",
    selectedModel: "",
    messages: [],
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
