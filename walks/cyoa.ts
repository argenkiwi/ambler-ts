import { amble, Nextable, node } from "../ambler.ts";
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

const nodes: Record<string, Nextable<State>> = {
  start: node(() =>
    OllamaDiscoverNode.create({ onDiscovered: nodes.modelSelect }),
  ),
  modelSelect: node(() => ModelSelectNode.create({ onSelect: nodes.intro })),
  intro: node(() => StoryIntroNode.create({ onIntroComplete: nodes.page })),
  page: node(() =>
    StoryPageNode.create({
      onPageComplete: nodes.save,
      onDecisionRequired: nodes.decision,
    }),
  ),
  decision: node(() =>
    StoryDecisionNode.create({ onDecisionMade: nodes.page }),
  ),
  save: node(() =>
    StorySaveNode.create({ onSaveComplete: async (_state: State) => null }),
  ),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
