import { ambler } from "../ambler.ts";
import { factory as kpsStartNode } from "../nodes/kpsStart.ts";
import { factory as playerChoiceNode } from "../nodes/playerChoice.ts";
import { factory as computerChoiceNode } from "../nodes/computerChoice.ts";
import { factory as compareNode } from "../nodes/compare.ts";
import { factory as resultNode } from "../nodes/result.ts";
import { factory as kpsPlayAgainNode } from "../nodes/kpsPlayAgain.ts";
import { factory as kpsStopNode } from "../nodes/kpsStop.ts";

export interface State {
  playerHealth: number;
  cpuHealth: number;
  playerMove: string | null;
  cpuMove: string | null;
  outcome: string | null;
}

type NodeId =
  | "start"
  | "playerChoice"
  | "computerChoice"
  | "compare"
  | "result"
  | "playAgain"
  | "stop";

/**
 * KPS (Kick-Punch-Sweep) Walk
 * 
 * A combat-based variation of Rock-Paper-Scissors with health and six move options:
 * - Offensive: Kick, Punch, Sweep (Triangle: Kick > Punch > Sweep > Kick)
 * - Defensive: Crouch, Block, Jump (Counter specific offensive moves)
 * 
 * Outcomes:
 * - Win/Lose: 2 damage
 * - Trade: 1 damage to both (offensive same-move or clash)
 * - Chip/Ouch: 1 damage (offensive vs wrong defensive)
 * - Dodge/Miss: 1 HP recovered by defender (offensive vs correct defensive)
 * - Draw: No damage (defensive vs defensive or non-countering offensive)
 */
const amble = ambler<State, NodeId>({
  start: () => kpsStartNode({ onSuccess: "playerChoice" }),
  playerChoice: () => playerChoiceNode({ onSuccess: "computerChoice", onError: "playerChoice" }),
  computerChoice: () => computerChoiceNode({ onSuccess: "compare" }),
  compare: () => compareNode({ onSuccess: "result" }),
  result: () => resultNode({ onContinue: "playerChoice", onGameOver: "playAgain" }),
  playAgain: () => kpsPlayAgainNode({ onPlayAgain: "start", onQuit: "stop" }),
  stop: () => kpsStopNode<NodeId>({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "start";
  let state: State = {
    playerHealth: 10,
    cpuHealth: 10,
    playerMove: null,
    cpuMove: null,
    outcome: null,
  };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
