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

const amble = ambler<State, NodeId>({
  start: () => {
    const core = ollamaDiscoverFactory({
      onDiscovered: "modelSelect",
      onCancel: null,
    });
    return async (state) => {
      const [nodeId, ollamaHost] = await core();
      return [nodeId, { ...state, ollamaHost }];
    };
  },
  modelSelect: () => {
    const core = modelSelectFactory({
      onSelect: "prompt",
      onCancel: null,
    });
    return async (state) => {
      const [nodeId, selectedModel] = await core(state.ollamaHost);
      return [nodeId, { ...state, selectedModel }];
    };
  },
  prompt: () => {
    const core = chatPromptFactory({
      onChat: "response",
      onQuit: "bye",
    });
    return (state) => {
      const [nodeId, messages] = core(state.messages);
      return [nodeId, { ...state, messages }];
    };
  },
  response: () => {
    const core = chatResponseFactory({
      onPrompt: "prompt",
    });
    return async (state) => {
      const [nodeId, messages] = await core({
        ollamaHost: state.ollamaHost,
        selectedModel: state.selectedModel,
        messages: state.messages,
      });
      return [nodeId, { ...state, messages }];
    };
  },
  bye: () => {
    const core = chatByeFactory<NodeId>({ onDone: null });
    return (state) => {
      const [nodeId, _] = core();
      return [nodeId, state];
    };
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
