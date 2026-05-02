import { ambler } from "../ambler.ts";
import ollamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import modelSelectNode from "../nodes/modelSelectNode.ts";
import storyIntroNode from "../nodes/storyIntroNode.ts";
import storyPageNode from "../nodes/storyPageNode.ts";
import storyDecisionNode from "../nodes/storyDecisionNode.ts";
import storySaveNode from "../nodes/storySaveNode.ts";

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

const amble = ambler({
  start: ollamaDiscoverNode<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: modelSelectNode<State, NodeId>({
    onSelect: "intro",
    onCancel: null,
  }),
  intro: storyIntroNode<State, NodeId>({
    onIntroComplete: "page",
    onCancel: null,
  }),
  page: storyPageNode<State, NodeId>({
    onPageComplete: "save",
    onDecisionRequired: "decision",
    onError: null,
  }),
  decision: storyDecisionNode<State, NodeId>({
    onDecisionMade: "page",
    onCancel: null,
    onError: null,
  }),
  save: storySaveNode<State, NodeId>({ onSaveComplete: null }),
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
