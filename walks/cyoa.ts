import { ambler } from "../ambler.ts";
import { factory as ollamaDiscoverFactory } from "../cores/ollamaDiscover.ts";
import { factory as modelSelectFactory } from "../cores/modelSelect.ts";
import { factory as storyIntroFactory } from "../cores/storyIntro.ts";
import { factory as storyPageFactory } from "../cores/storyPage.ts";
import { factory as storyDecisionFactory } from "../cores/storyDecision.ts";
import { factory as storySaveFactory } from "../cores/storySave.ts";

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

const ollamaDiscoverCore = ollamaDiscoverFactory<NodeId>({
  onDiscovered: "modelSelect",
  onCancel: null,
});

const modelSelectCore = modelSelectFactory<NodeId>({
  onSelect: "intro",
  onCancel: null,
});

const storyIntroCore = storyIntroFactory<NodeId>({
  onIntroComplete: "page",
  onCancel: null,
});

const storyPageCore = storyPageFactory<NodeId>({
  onPageComplete: "save",
  onDecisionRequired: "decision",
  onError: null,
});

const storyDecisionCore = storyDecisionFactory<NodeId>({
  onDecisionMade: "page",
  onCancel: null,
  onError: null,
});

const storySaveCore = storySaveFactory<NodeId>({
  onSaveComplete: null,
});

const amble = ambler<State, NodeId>({
  start: async (state) => {
    const [nodeId, ollamaHost] = await ollamaDiscoverCore();
    return [nodeId, { ...state, ollamaHost }];
  },
  modelSelect: async (state) => {
    const [nodeId, selectedModel] = await modelSelectCore(state.ollamaHost);
    return [nodeId, { ...state, selectedModel }];
  },
  intro: (state) => {
    const [nodeId, output] = storyIntroCore();
    return [nodeId, {
      ...state,
      identity: output.identity,
      placement: output.placement,
      circumstances: output.circumstances,
    }];
  },
  page: async (state) => {
    const [nodeId, output] = await storyPageCore({
      selectedModel: state.selectedModel,
      ollamaHost: state.ollamaHost,
      identity: state.identity,
      placement: state.placement,
      circumstances: state.circumstances,
      storyPages: state.storyPages,
      currentPage: state.currentPage,
    });
    return [nodeId, {
      ...state,
      storyPages: output.storyPages,
      currentPage: output.currentPage,
    }];
  },
  decision: async (state) => {
    const [nodeId, storyPages] = await storyDecisionCore(state.storyPages);
    return [nodeId, { ...state, storyPages }];
  },
  save: async (state) => {
    const [nodeId, _] = await storySaveCore(state.storyPages);
    return [nodeId, state];
  },
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
