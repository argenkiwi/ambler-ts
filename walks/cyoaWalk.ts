import { amble, node, Nextable } from "../ambler.ts";
import { ModelSelectNode } from "../nodes/modelSelectNode.ts";
import { StoryIntroNode } from "../nodes/storyIntroNode.ts";
import { StoryPageNode } from "../nodes/storyPageNode.ts";
import { StoryDecisionNode } from "../nodes/storyDecisionNode.ts";
import { StorySaveNode } from "../nodes/storySaveNode.ts";
import { StopNode } from "../nodes/stopNode.ts";

export interface State {
  selectedModel: string;
  identity: string;
  placement: string;
  circumstances: string;
  storyPages: string[];
}

const initialState: State = {
  selectedModel: "",
  identity: "",
  placement: "",
  circumstances: "",
  storyPages: [],
};

const nodes: Record<string, Nextable<State>> = {
  start: node(() => ModelSelectNode.create({ onSelect: nodes.intro })),
  intro: node(() => StoryIntroNode.create({ onIntroComplete: nodes.page })),
  page: node(() => StoryPageNode.create({ onPageComplete: nodes.save, onDecisionRequired: nodes.decision })),
  decision: node(() => StoryDecisionNode.create({ onDecisionMade: nodes.page })),
  save: node(() => StorySaveNode.create({ onSaveComplete: nodes.stop })),
  stop: node(() => StopNode.create()),
};

if (import.meta.main) {
  await amble(nodes.start, initialState);
}
