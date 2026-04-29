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

type NodeId = "start" | "modelSelect" | "intro" | "page" | "decision" | "save";
const nodes: Record<NodeId, Node<State, NodeId>> = {
  start: OllamaDiscoverNode.create({
    onDiscovered: "modelSelect",
    onCancel: null,
  }),
  modelSelect: ModelSelectNode.create({
    onSelect: "intro",
    onCancel: null,
  }),
  intro: StoryIntroNode.create({
    onIntroComplete: "page",
    onCancel: null,
  }),
  page: StoryPageNode.create({
    onPageComplete: "save",
    onDecisionRequired: "decision",
    onError: null,
  }),
  decision: StoryDecisionNode.create({
    onDecisionMade: "page",
    onCancel: null,
    onError: null,
  }),
  save: StorySaveNode.create<State, NodeId>({ onSaveComplete: null }),
};

const initialNodeId: NodeId = "start";
const initialState: State = {
  ollamaHost: "",
  selectedModel: "",
  identity: "",
  placement: "",
  circumstances: "",
  storyPages: [],
  currentPage: 1,
};

if (import.meta.main) {
  await amble(nodes, initialNodeId, initialState);
}
