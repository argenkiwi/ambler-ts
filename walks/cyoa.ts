import { amble, Node } from "../ambler.ts";
import * as OllamaDiscoverNode from "../nodes/ollamaDiscoverNode.ts";
import * as ModelSelectNode from "../nodes/modelSelectNode.ts";
import * as StoryIntroNode from "../nodes/storyIntroNode.ts";
import * as StoryPageNode from "../nodes/storyPageNode.ts";
import * as StoryDecisionNode from "../nodes/storyDecisionNode.ts";
import * as StorySaveNode from "../nodes/storySaveNode.ts";

export interface State {
  ollamaHost: string;
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
  currentPage: number;
}

const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  identity: "",
  placement: "",
  circumstances: "",
  storyPages: [],
  currentPage: 1,
};

type NodeId = "start" | "modelSelect" | "intro" | "page" | "decision" | "save";

const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: OllamaDiscoverNode.create<State, NodeId>({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: ModelSelectNode.create<State, NodeId>({
    onSelect: "intro",
    onCancel: null,
  }),
  intro: StoryIntroNode.create<State, NodeId>({
    onIntroComplete: "page",
    onCancel: null,
  }),
  page: StoryPageNode.create<State, NodeId>({
    onPageComplete: "save",
    onDecisionRequired: "decision",
    onError: null,
  }),
  decision: StoryDecisionNode.create<State, NodeId>({
    onDecisionMade: "page",
    onCancel: null,
    onError: null,
  }),
  save: StorySaveNode.create<State, NodeId>({ onSaveComplete: null }),
};

if (import.meta.main) {
  await amble<State, NodeId>(nodes, "start", initialState);
}
