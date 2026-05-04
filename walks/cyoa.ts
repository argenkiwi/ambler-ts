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

const amble = ambler<State, NodeId>((bind) => ({
  start: bind(ollamaDiscoverNode, {
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: bind(modelSelectNode, { onSelect: "intro", onCancel: null }),
  intro: bind(storyIntroNode, { onIntroComplete: "page", onCancel: null }),
  page: bind(storyPageNode, {
    onPageComplete: "save",
    onDecisionRequired: "decision",
    onError: null,
  }),
  decision: bind(storyDecisionNode, {
    onDecisionMade: "page",
    onCancel: null,
    onError: null,
  }),
  save: bind(storySaveNode, { onSaveComplete: null }),
}));

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
    [nodeId, state] = typeof next === "function" ? next : await next;
  }
}
