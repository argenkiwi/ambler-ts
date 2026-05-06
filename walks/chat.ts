import { ambler } from "../ambler.ts";
import { factory as ollamaDiscoverFactory } from "../cores/ollamaDiscover.ts";
import { factory as modelSelectFactory } from "../cores/modelSelect.ts";
import { factory as chatPromptFactory } from "../cores/chatPrompt.ts";
import { factory as chatResponseFactory } from "../cores/chatResponse.ts";
import { factory as chatByeFactory } from "../cores/chatBye.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  messages: Array<{ role: string; content: string }>;
}

type NodeId = "start" | "modelSelect" | "prompt" | "response" | "bye";

const ollamaDiscoverCore = ollamaDiscoverFactory<NodeId>({
  onDiscovered: "modelSelect",
  onCancel: null,
});

const modelSelectCore = modelSelectFactory<NodeId>({
  onSelect: "prompt",
  onCancel: null,
});

const chatPromptCore = chatPromptFactory<NodeId>({
  onChat: "response",
  onQuit: "bye",
});

const chatResponseCore = chatResponseFactory<NodeId>({
  onPrompt: "prompt",
});

const chatByeCore = chatByeFactory<NodeId>({
  onDone: null,
});

const amble = ambler<State, NodeId>({
  start: async (state) => {
    const [nodeId, ollamaHost] = await ollamaDiscoverCore();
    return [nodeId, { ...state, ollamaHost }];
  },
  modelSelect: async (state) => {
    const [nodeId, selectedModel] = await modelSelectCore(state.ollamaHost);
    return [nodeId, { ...state, selectedModel }];
  },
  prompt: (state) => {
    const [nodeId, messages] = chatPromptCore(state.messages);
    return [nodeId, { ...state, messages }];
  },
  response: async (state) => {
    const [nodeId, messages] = await chatResponseCore({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      messages: state.messages,
    });
    return [nodeId, { ...state, messages }];
  },
  bye: (state) => {
    const [nodeId, _] = chatByeCore();
    return [nodeId, state];
  },
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
