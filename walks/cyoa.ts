import { amble, Nextable, node } from "../ambler.ts";
import { OllamaDiscoverNode } from "../nodes/ollamaDiscoverNode.ts";
import { ModelSelectNode } from "../nodes/modelSelectNode.ts";
import { StoryIntroNode } from "../nodes/storyIntroNode.ts";
import { StoryPageNode } from "../nodes/storyPageNode.ts";
import { StoryDecisionNode } from "../nodes/storyDecisionNode.ts";
import { StorySaveNode } from "../nodes/storySaveNode.ts";

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
    OllamaDiscoverNode.create({ onDiscovered: nodes.modelSelect })
  ),
  modelSelect: node(() => ModelSelectNode.create({ onSelect: nodes.intro })),
  intro: node(() => StoryIntroNode.create({ onIntroComplete: nodes.page })),
  page: node(() =>
    StoryPageNode.create({
      onPageComplete: nodes.save,
      onDecisionRequired: nodes.decision,
    })
  ),
  decision: node(() =>
    StoryDecisionNode.create({ onDecisionMade: nodes.page })
  ),
  save: node(() =>
    StorySaveNode.create({ onSaveComplete: (state: State) => null })
  ),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
