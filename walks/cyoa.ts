import { adapt, ambler } from "../ambler.ts";
import { factory as ollamaDiscoverNode } from "../nodes/ollamaDiscoverNode.ts";
import { factory as modelSelectNode } from "../nodes/modelSelectNode.ts";
import { factory as storyIntroNode } from "../nodes/storyIntroNode.ts";
import { factory as storyPageNode } from "../nodes/storyPageNode.ts";
import { factory as storyDecisionNode } from "../nodes/storyDecisionNode.ts";
import { factory as storySaveNode } from "../nodes/storySaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
  currentPage: number;
}

type NodeId = "start" | "modelSelect" | "intro" | "page" | "decision" | "save";

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
    modelSelectNode({ onSelect: "intro", onCancel: null }),
    (state) => ({ ollamaHost: state.ollamaHost }),
    (state, output) => ({ ...state, selectedModel: output.selectedModel }),
  ),
  intro: adapt(
    storyIntroNode({ onIntroComplete: "page", onCancel: null }),
    () => {},
    (state, output) => ({
      ...state,
      identity: output.identity,
      placement: output.placement,
      circumstances: output.circumstances,
    }),
  ),
  page: adapt(
    storyPageNode({
      onPageComplete: "save",
      onDecisionRequired: "decision",
      onError: null,
    }),
    (state) => ({
      selectedModel: state.selectedModel,
      ollamaHost: state.ollamaHost,
      identity: state.identity,
      placement: state.placement,
      circumstances: state.circumstances,
      storyPages: state.storyPages,
      currentPage: state.currentPage,
    }),
    (state, output) => ({
      ...state,
      storyPages: output.storyPages,
      currentPage: output.currentPage,
    }),
  ),
  decision: adapt(
    storyDecisionNode({
      onDecisionMade: "page",
      onCancel: null,
      onError: null,
    }),
    (state) => ({ storyPages: state.storyPages }),
    (state, output) => ({ ...state, storyPages: output.storyPages }),
  ),
  save: adapt(
    storySaveNode<NodeId>({ onSaveComplete: null }),
    (state) => ({ storyPages: state.storyPages }),
    (state) => state,
  ),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    ollamaHost: "",
    selectedModel: "",
    identity: "",
    placement: "",
    circumstances: "",
    storyPages: [],
    currentPage: 1,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
