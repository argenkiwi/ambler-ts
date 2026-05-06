import { ambler, Node } from "../ambler.ts";
import { factory as ollamaDiscoverFactory } from "../cores/ollamaDiscover.ts";
import { factory as modelSelectFactory } from "../cores/modelSelect.ts";
import { factory as solarPromptFactory } from "../cores/solarPrompt.ts";
import { factory as solarGenerateFactory } from "../cores/solarGenerate.ts";
import { factory as solarSaveFactory } from "../cores/solarSave.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

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
  const core = solarPromptFactory({
    onPromptComplete: "generate",
    onCancel: null,
  });

  return (state: State) => {
    const [nodeId, solarPrompt] = core();
    return [nodeId, { ...state, solarPrompt }];
  };
};

const generateNode = (): Node<State, NodeId> => {
  const core = solarGenerateFactory({
    onGenerateComplete: "save",
    onError: null,
  });

  return async (state: State) => {
    const [nodeId, generatedStory] = await core({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      solarPrompt: state.solarPrompt,
    });
    return [nodeId, { ...state, generatedStory }];
  };
};

const saveNode = (): Node<State, NodeId> => {
  const core = solarSaveFactory<NodeId>({
    onSaveComplete: null,
  });

  return async (state: State) => {
    const [nodeId, _] = await core(state.generatedStory);
    return [nodeId, state];
  };
};

const amble = ambler<State, NodeId>({
  start: startNode(),
  modelSelect: modelSelectNode(),
  prompt: promptNode(),
  generate: generateNode(),
  save: saveNode(),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    ollamaHost: "",
    selectedModel: "",
    solarPrompt: "",
    generatedStory: "",
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
