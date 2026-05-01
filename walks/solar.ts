import { ambler, Node } from "../ambler.ts";
import * as OllamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import * as ModelSelectNode from "../nodes/modelSelectNode.ts";
import * as SolarPromptNode from "../nodes/solarPromptNode.ts";
import * as SolarGenerateNode from "../nodes/solarGenerateNode.ts";
import * as SolarSaveNode from "../nodes/solarSaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: OllamaDiscoverNode.create<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: ModelSelectNode.create<State, NodeId>({
    onSelect: "prompt",
    onCancel: null,
  }),
  prompt: SolarPromptNode.create<State, NodeId>({
    onPromptComplete: "generate",
    onCancel: null,
  }),
  generate: SolarGenerateNode.create<State, NodeId>({
    onGenerateComplete: "save",
    onError: null,
  }),
  save: SolarSaveNode.create<State, NodeId>({ onSaveComplete: null }),
};

const amble = ambler(nodes);

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
