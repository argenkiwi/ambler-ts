import { ambler } from "../ambler.ts";
import { factory as ollamaCheck } from "../nodes/ollama-check.ts";
import { factory as modelSelect } from "../nodes/model-select.ts";
import { factory as storyIntro } from "../nodes/story-intro.ts";
import { factory as storyPage } from "../nodes/story-page.ts";
import { factory as storyDecision } from "../nodes/story-decision.ts";
import { factory as storySave } from "../nodes/story-save.ts";

export interface State {
  host: string;
  model: string;
  identity: string;
  placement: string;
  circumstances: string;
  story_pages: string[];
  current_page: number;
}

type NodeId =
  | "OLLAMA_CHECK"
  | "MODEL_SELECT"
  | "STORY_INTRO"
  | "STORY_PAGE"
  | "STORY_DECISION"
  | "STORY_SAVE";

const amble = ambler<State, NodeId>({
  OLLAMA_CHECK: () =>
    ollamaCheck({ onSuccess: "MODEL_SELECT", onError: "OLLAMA_CHECK" }),
  MODEL_SELECT: () => modelSelect({ onSuccess: "STORY_INTRO" }),
  STORY_INTRO: () =>
    storyIntro({ onComplete: "STORY_PAGE", onCancel: null }),
  STORY_PAGE: () =>
    storyPage({
      onStoryEnd: "STORY_SAVE",
      onStoryContinue: "STORY_DECISION",
    }),
  STORY_DECISION: () =>
    storyDecision({ onSelect: "STORY_PAGE", onCancel: null }),
  STORY_SAVE: () => storySave<NodeId, State>({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "OLLAMA_CHECK";
  let state: State = {
    host: "",
    model: "",
    identity: "",
    placement: "",
    circumstances: "",
    story_pages: [],
    current_page: 1,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
