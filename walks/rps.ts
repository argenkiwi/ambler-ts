import { ambler } from "../ambler.ts";
import { factory as startNode } from "../nodes/rpsStart.ts";
import { factory as computeChoiceNode } from "../nodes/computeChoice.ts";
import { factory as determineResultNode } from "../nodes/determineResult.ts";
import { factory as displayResultNode } from "../nodes/displayResult.ts";
import { factory as playAgainNode } from "../nodes/playAgain.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

type NodeId =
  | "rpsStart"
  | "computeChoice"
  | "determineResult"
  | "displayResult"
  | "playAgain";

const amble = ambler<State, NodeId>({
  rpsStart: () =>
    startNode({
      onSuccess: "computeChoice",
      onError: "rpsStart",
    }),
  computeChoice: () =>
    computeChoiceNode({
      onComplete: "determineResult",
    }),
  determineResult: () =>
    determineResultNode({
      onComplete: "displayResult",
    }),
  displayResult: () =>
    displayResultNode({
      onComplete: "playAgain",
    }),
  playAgain: () =>
    playAgainNode({
      onPlayAgain: "rpsStart",
      onQuit: null,
    }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "rpsStart";
  let state: State = {
    userChoice: null,
    computerChoice: null,
    result: null,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
