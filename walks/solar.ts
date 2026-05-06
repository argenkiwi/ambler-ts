import { adapt, ambler } from "../ambler.ts";
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

const amble = ambler<State, NodeId>({
  start: adapt(
    ollamaDiscoverNode({
      onDiscovered: "modelSelect",
      onCancel: null,
    }),
    () => {},
    (state, output) => ({ ...state, ollamaHost: output.ollamaHost }),
  ),
  modelSelect: adapt(
    modelSelectNode({ onSelect: "prompt", onCancel: null }),
    (state) => ({ ollamaHost: state.ollamaHost }),
    (state, output) => ({ ...state, selectedModel: output.selectedModel }),
  ),
  prompt: adapt(
    solarPromptNode({ onPromptComplete: "generate", onCancel: null }),
    () => {},
    (state, output) => ({ ...state, solarPrompt: output.solarPrompt }),
  ),
  generate: adapt(
    solarGenerateNode({ onGenerateComplete: "save", onError: null }),
    (state) => ({
      ollamaHost: state.ollamaHost,
      selectedModel: state.selectedModel,
      solarPrompt: state.solarPrompt,
    }),
    (state, output) => ({ ...state, generatedStory: output.generatedStory }),
  ),
  save: adapt(
    solarSaveNode<NodeId>({ onSaveComplete: null }),
    (state) => ({ generatedStory: state.generatedStory }),
    (state) => state,
  ),
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
