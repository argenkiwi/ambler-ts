import { ambler, Node } from "../ambler.ts";
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

const startNode = (): Node<State, NodeId> => {
  const core = ollamaDiscoverFactory({
    onDiscovered: "modelSelect",
    onCancel: null,
  });

  return async (state: State) => {
    const [nodeId, ollamaHost] = await core();
    return [nodeId, { ...state, ollamaHost }];
  };
};

const modelSelectNode = (): Node<State, NodeId> => {
  const core = modelSelectFactory({
    onSelect: "prompt",
    onCancel: null,
  });

  return async (state: State) => {
    const [nodeId, selectedModel] = await core(state.ollamaHost);
    return [nodeId, { ...state, selectedModel }];
  };
};

const promptNode = (): Node<State, NodeId> => {
  const core = chatPromptFactory({
    onChat: "response",
    onQuit: "bye",
  });

  return (state: State) => {
    const [nodeId, messages] = core(state.messages);
    return [nodeId, { ...state, messages }];
  };
};

const responseNode = (): Node<State, NodeId> => {
  const core = chatResponseFactory({
    onPrompt: "prompt",
  });

  return async (state: State) => {
    const [nodeId, messages] = await core({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      messages: state.messages,
    });
    return [nodeId, { ...state, messages }];
  };
};

const byeNode = (): Node<State, NodeId> => {
  const core = chatByeFactory<NodeId>({ onDone: null });
  return (state: State) => {
    const [nodeId, _] = core();
    return [nodeId, state];
  };
};

const amble = ambler<State, NodeId>({
  start: startNode(),
  modelSelect: modelSelectNode(),
  prompt: promptNode(),
  response: responseNode(),
  bye: byeNode(),
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
