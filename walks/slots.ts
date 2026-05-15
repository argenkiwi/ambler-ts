import { ambler } from "../ambler.ts";
import { factory as betNode } from "../nodes/bet.ts";
import { factory as spinNode } from "../nodes/spin.ts";
import { factory as resultNode } from "../nodes/result.ts";
import { factory as gameOverNode } from "../nodes/gameOver.ts";

export interface State {
  nbPoints: number;
  bet: number;
  symbols: string[];
}

type NodeId = "bet" | "spin" | "result" | "gameOver";

const amble = ambler<State, NodeId>({
  bet:       () => betNode({ onSpin: "spin", onInvalid: "bet", onGameOver: "gameOver" }),
  spin:      () => spinNode({ onResult: "result" }),
  result:    () => resultNode({ onBet: "bet", onGameOver: "gameOver" }),
  gameOver:  () => gameOverNode({ onDone: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "bet";
  let state: State = { nbPoints: 200, bet: 0, symbols: [] };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
