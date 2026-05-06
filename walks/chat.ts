import { adapt, ambler } from "../ambler.ts";
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

const amble = ambler<State, NodeId>({
  start: adapt(
    ollamaDiscoverNode({
      onDiscovered: "modelSelect",
      onCancel: null,
    }),
    () => {},
    (state, output) => ({ ...state, ollamaHost: output.ollamaHost }),
  ),
  modelSelect: adapt(
    modelSelectNode({ onSelect: "prompt", onCancel: null }),
    (state) => ({ ollamaHost: state.ollamaHost }),
    (state, output) => ({ ...state, selectedModel: output.selectedModel }),
  ),
  prompt: adapt(
    chatPromptNode({ onChat: "response", onQuit: "bye" }),
    (state) => ({ messages: state.messages }),
    (state, output) => ({ ...state, messages: output.messages }),
  ),
  response: adapt(
    chatResponseNode({ onPrompt: "prompt" }),
    (state) => ({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      messages: state.messages,
    }),
    (state, output) => ({ ...state, messages: output.messages }),
  ),
  bye: adapt(
    chatByeNode<NodeId>({ onDone: null }),
    () => {},
    (state) => state,
  ),
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
