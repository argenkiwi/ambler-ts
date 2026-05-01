import { ambler } from "../ambler.ts";
import ollamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import modelSelectNode from "../nodes/modelSelectNode.ts";
import solarPromptNode from "../nodes/solarPromptNode.ts";
import solarGenerateNode from "../nodes/solarGenerateNode.ts";
import solarSaveNode from "../nodes/solarSaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  solarPrompt: string;
  generatedStory: string;
}

type NodeId = "start" | "modelSelect" | "prompt" | "generate" | "save";

const amble = ambler({
  start: ollamaDiscoverNode<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: modelSelectNode<State, NodeId>({
    onSelect: "prompt",
    onCancel: null,
  }),
  prompt: solarPromptNode<State, NodeId>({
    onPromptComplete: "generate",
    onCancel: null,
  }),
  generate: solarGenerateNode<State, NodeId>({
    onGenerateComplete: "save",
    onError: null,
  }),
  save: solarSaveNode<State, NodeId>({ onSaveComplete: null }),
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
