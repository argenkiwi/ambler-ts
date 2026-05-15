import { ambler } from "../ambler.ts";
import { factory as ollamaCheck } from "../nodes/ollama-check.ts";
import { factory as modelSelect } from "../nodes/model-select.ts";
import { factory as prompt } from "../nodes/prompt.ts";
import { factory as transpose } from "../nodes/transpose.ts";
import { factory as response } from "../nodes/response.ts";
import { factory as chatBye } from "../nodes/chat-bye.ts";

export interface State {
  messages: { role: "user" | "assistant"; content: string }[];
  host: string;
  model: string;
}

type NodeId =
  | "OLLAMA_CHECK"
  | "MODEL_SELECT"
  | "PROMPT"
  | "TRANSPOSE"
  | "RESPONSE"
  | "CHAT_BYE";

const amble = ambler<State, NodeId>({
  OLLAMA_CHECK: () =>
    ollamaCheck({ onSuccess: "MODEL_SELECT", onError: "OLLAMA_CHECK" }),
  MODEL_SELECT: () => modelSelect({ onSuccess: "PROMPT" }),
  PROMPT: () => prompt({ onMessage: "TRANSPOSE", onQuit: "CHAT_BYE" }),
  TRANSPOSE: () => transpose({ onComplete: "RESPONSE" }),
  RESPONSE: () => response({ onComplete: "PROMPT" }),
  CHAT_BYE: () => chatBye({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "OLLAMA_CHECK";
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
