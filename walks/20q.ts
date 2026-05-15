import { ambler } from "../ambler.ts";
import { factory as ollamaCheckNode } from "../nodes/ollama-check.ts";
import { factory as modelSelectNode } from "../nodes/model-select.ts";
import { factory as gameStartNode, Message } from "../nodes/game-start.ts";
import { factory as llmQuestionNode } from "../nodes/llm-question.ts";
import { factory as humanResponseNode } from "../nodes/human-response.ts";
import { factory as checkConditionNode } from "../nodes/check-condition.ts";
import { factory as gameOverNode } from "../nodes/game-over.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
  questionCount: number;
  guessCount: number;
  outcome?: "win" | "loss" | "quit";
}

type NodeId =
  | "ollama-check"
  | "model-select"
  | "game-start"
  | "llm-question"
  | "human-response"
  | "check-condition"
  | "game-over";

const amble = ambler<State, NodeId>({
  "ollama-check": () =>
    ollamaCheckNode({ onSuccess: "model-select", onError: "ollama-check" }),
  "model-select": () =>
    modelSelectNode({ onSuccess: "game-start" }),
  "game-start": () =>
    gameStartNode({ onSuccess: "llm-question" }),
  "llm-question": () =>
    llmQuestionNode({ onSuccess: "human-response" }),
  "human-response": () =>
    humanResponseNode({ onSuccess: "check-condition", onQuit: "game-over" }),
  "check-condition": () =>
    checkConditionNode({
      onContinue: "llm-question",
      onWin: "game-over",
      onLoss: "game-over",
    }),
  "game-over": () =>
    gameOverNode({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "ollama-check";
  let state: State = {
    messages: [],
    host: "",
    model: "",
    questionCount: 0,
    guessCount: 0,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
