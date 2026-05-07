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

const amble = ambler<State, NodeId>({
  start: () => {
    const core = ollamaDiscoverFactory({
      onDiscovered: "modelSelect",
      onCancel: null,
    });
    return async (state) => {
      const [nodeId, ollamaHost] = await core();
      return [nodeId, { ...state, ollamaHost }];
    };
  },
  modelSelect: () => {
    const core = modelSelectFactory({
      onSelect: "intro",
      onCancel: null,
    });
    return async (state) => {
      const [nodeId, selectedModel] = await core(state.ollamaHost);
      return [nodeId, { ...state, selectedModel }];
    };
  },
  intro: () => {
    const core = storyIntroFactory({
      onIntroComplete: "page",
      onCancel: null,
    });
    return (state) => {
      const [nodeId, output] = core();
      return [nodeId, {
        ...state,
        identity: output.identity,
        placement: output.placement,
        circumstances: output.circumstances,
      }];
    };
  },
  page: () => {
    const core = storyPageFactory({
      onPageComplete: "save",
      onDecisionRequired: "decision",
      onError: null,
    });
    return async (state) => {
      const [nodeId, output] = await core({
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
    };
  },
  decision: () => {
    const core = storyDecisionFactory({
      onDecisionMade: "page",
      onCancel: null,
      onError: null,
    });
    return async (state) => {
      const [nodeId, storyPages] = await core(state.storyPages);
      return [nodeId, { ...state, storyPages }];
    };
  },
  save: () => {
    const core = storySaveFactory<NodeId>({
      onSaveComplete: null,
    });
    return async (state) => {
      const [nodeId, _] = await core(state.storyPages);
      return [nodeId, state];
    };
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
    currentPage: 0,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
