import { ambler } from "../ambler.ts";
import { factory as llmCheck } from "../nodes/llm-check.ts";
import { factory as modelSelect } from "../nodes/model-select.ts";
import { factory as chatPrompt, Message } from "../nodes/prompt.ts";
import { factory as chatResponse } from "../nodes/response.ts";
import { factory as chatBye } from "../nodes/chat-bye.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
}

type NodeId =
  | "LLM_CHECK"
  | "MODEL_SELECT"
  | "CHAT_PROMPT"
  | "CHAT_RESPONSE"
  | "CHAT_BYE";

const amble = ambler<State, NodeId>({
  LLM_CHECK: () =>
    llmCheck({ onSuccess: "MODEL_SELECT", onError: "LLM_CHECK" }),
  MODEL_SELECT: () => modelSelect({ onSuccess: "CHAT_PROMPT" }),
  CHAT_PROMPT: () =>
    chatPrompt({ onMessage: "CHAT_RESPONSE", onQuit: "CHAT_BYE" }),
  CHAT_RESPONSE: () => chatResponse({ onComplete: "CHAT_PROMPT" }),
  CHAT_BYE: () => chatBye({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "LLM_CHECK";
  let state: State = {
    messages: [],
    host: "",
    model: "",
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
