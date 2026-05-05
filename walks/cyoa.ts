import { ambler } from "../ambler.ts";
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
  start: ollamaDiscoverNode({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: modelSelectNode({ onSelect: "intro", onCancel: null }),
  intro: storyIntroNode({ onIntroComplete: "page", onCancel: null }),
  page: storyPageNode({
    onPageComplete: "save",
    onDecisionRequired: "decision",
    onError: null,
  }),
  decision: storyDecisionNode({
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
