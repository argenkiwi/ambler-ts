import { ambler } from "../ambler.ts";
import { factory as ollamaDiscoverNode } from "../nodes/ollamaDiscoverNode.ts";
import { factory as modelSelectNode } from "../nodes/modelSelectNode.ts";
import { factory as solarPromptNode } from "../nodes/solarPromptNode.ts";
import { factory as solarGenerateNode } from "../nodes/solarGenerateNode.ts";
import { factory as solarSaveNode } from "../nodes/solarSaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

const amble = ambler<State, NodeId>((bind) => ({
  start: bind(ollamaDiscoverNode, {
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: bind(modelSelectNode, { onSelect: "prompt", onCancel: null }),
  prompt: bind(solarPromptNode, {
    onPromptComplete: "generate",
    onCancel: null,
  }),
  generate: bind(solarGenerateNode, {
    onGenerateComplete: "save",
    onError: null,
  }),
  save: bind(solarSaveNode, { onSaveComplete: null }),
}));

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
