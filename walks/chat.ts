import { ambler, walk } from "../ambler.ts";
import {
  factory as llmCheck,
  type Utils as LlmCheckUtils,
} from "../nodes/llm-check.ts";
import {
  factory as modelSelect,
  type Utils as ModelSelectUtils,
} from "../nodes/model-select.ts";
import {
  factory as chatPrompt,
  Message,
  type Utils as PromptUtils,
} from "../nodes/prompt.ts";
import {
  factory as chatResponse,
  type Utils as ResponseUtils,
} from "../nodes/response.ts";
import {
  factory as chatBye,
  type Utils as ByeUtils,
} from "../nodes/chat-bye.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
}

export type NodeId =
  | "LLM_CHECK"
  | "MODEL_SELECT"
  | "CHAT_PROMPT"
  | "CHAT_RESPONSE"
  | "CHAT_BYE";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  llmCheck?: LlmCheckUtils;
  modelSelect?: ModelSelectUtils;
  prompt?: PromptUtils;
  response?: ResponseUtils;
  bye?: ByeUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    LLM_CHECK: () =>
      llmCheck({
        onSuccess: "MODEL_SELECT",
        onError: "LLM_CHECK",
        onQuit: "CHAT_BYE",
      }, utils.llmCheck),
    MODEL_SELECT: () =>
      modelSelect({ onSuccess: "CHAT_PROMPT" }, utils.modelSelect),
    CHAT_PROMPT: () =>
      chatPrompt(
        { onMessage: "CHAT_RESPONSE", onQuit: "CHAT_BYE" },
        utils.prompt,
      ),
    CHAT_RESPONSE: () =>
      chatResponse({ onComplete: "CHAT_PROMPT" }, utils.response),
    CHAT_BYE: () => chatBye({ onDone: null }, utils.bye),
  });
}

if (import.meta.main) {
  await walk(createWalk(), "LLM_CHECK", { messages: [], host: "", model: "" });
}
