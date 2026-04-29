import { amble, Node } from "../ambler.ts";
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

const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  solarPrompt: "",
  generatedStory: "",
};

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: OllamaDiscoverNode.create<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: ModelSelectNode.create({
    onSelect: "prompt",
    onCancel: null,
  }),
  prompt: SolarPromptNode.create({
    onPromptComplete: "generate",
    onCancel: null,
  }),
  generate: SolarGenerateNode.create({
    onGenerateComplete: "save",
    onError: null,
  }),
  save: SolarSaveNode.create<State, NodeId>({ onSaveComplete: null }),
};

if (import.meta.main) {
  await amble<State, NodeId>(nodes, "start", initialState);
}
