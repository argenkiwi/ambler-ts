import { ambler } from "../ambler.ts";
import { factory as ollamaDiscoverNode } from "../nodes/ollamaDiscover.ts";
import { factory as modelSelectNode } from "../nodes/modelSelect.ts";
import { factory as solarPromptNode } from "../nodes/solarPrompt.ts";
import { factory as solarGenerateNode } from "../nodes/solarGenerate.ts";
import { factory as solarSaveNode } from "../nodes/solarSave.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

const amble = ambler<State, NodeId>({
  start: () =>
    ollamaDiscoverNode({
      onDiscovered: "modelSelect",
      onCancel: null,
    }),
  modelSelect: () =>
    modelSelectNode({
      onSelect: "prompt",
      onCancel: null,
    }),
  prompt: () =>
    solarPromptNode({
      onPromptComplete: "generate",
      onCancel: null,
    }),
  generate: () =>
    solarGenerateNode({
      onGenerateComplete: "save",
      onError: null,
    }),
  save: () => solarSaveNode<NodeId, State>({ onSaveComplete: null }),
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
