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

const amble = ambler<State, NodeId>((bind) => ({
  start: bind(ollamaDiscoverNode, { onDiscovered: "modelSelect", onCancel: null }),
  modelSelect: bind(modelSelectNode, { onSelect: "prompt", onCancel: null }),
  prompt: bind(solarPromptNode, { onPromptComplete: "generate", onCancel: null }),
  generate: bind(solarGenerateNode, { onGenerateComplete: "save", onError: null }),
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
    [nodeId, state] = typeof next === 'function' ? next : await next;
  }
}
