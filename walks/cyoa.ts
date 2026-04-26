import { amble, Node, node, stop } from "../ambler.ts";
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

const nodes: Record<string, Node<State>> = {
  start: node(() =>
    OllamaDiscoverNode.create({
      onDiscovered: nodes.modelSelect,
      onCancel: () => stop(),
    })
  ),
  modelSelect: node(() =>
    ModelSelectNode.create({
      onSelect: nodes.intro,
      onCancel: () => stop(),
    })
  ),
  intro: node(() =>
    StoryIntroNode.create({
      onIntroComplete: nodes.page,
      onCancel: () => stop(),
    })
  ),
  page: node(() =>
    StoryPageNode.create({
      onPageComplete: nodes.save,
      onDecisionRequired: nodes.decision,
      onError: () => stop(),
    })
  ),
  decision: node(() =>
    StoryDecisionNode.create({
      onDecisionMade: nodes.page,
      onCancel: () => stop(),
      onError: () => stop(),
    })
  ),
  save: node(() =>
    StorySaveNode.create({ onSaveComplete: (_state: State) => stop() })
  ),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
