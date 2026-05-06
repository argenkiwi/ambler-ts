import { ambler } from "../ambler.ts";
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

const ollamaDiscoverCore = ollamaDiscoverFactory<NodeId>({
  onDiscovered: "modelSelect",
  onCancel: null,
});

const modelSelectCore = modelSelectFactory<NodeId>({
  onSelect: "prompt",
  onCancel: null,
});

const solarPromptCore = solarPromptFactory<NodeId>({
  onPromptComplete: "generate",
  onCancel: null,
});

const solarGenerateCore = solarGenerateFactory<NodeId>({
  onGenerateComplete: "save",
  onError: null,
});

const solarSaveCore = solarSaveFactory<NodeId>({
  onSaveComplete: null,
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
    const [nodeId, solarPrompt] = solarPromptCore();
    return [nodeId, { ...state, solarPrompt }];
  },
  generate: async (state) => {
    const [nodeId, generatedStory] = await solarGenerateCore({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      solarPrompt: state.solarPrompt,
    });
    return [nodeId, { ...state, generatedStory }];
  },
  save: async (state) => {
    const [nodeId, _] = await solarSaveCore(state.generatedStory);
    return [nodeId, state];
  },
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
