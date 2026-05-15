import { ambler } from "../ambler.ts";
import { factory as gameStartNode } from "../nodes/game-start.ts";
import { factory as displayNode } from "../nodes/display.ts";
import { factory as guessNode } from "../nodes/guess.ts";
import { factory as checkNode } from "../nodes/check.ts";
import { factory as winNode } from "../nodes/win.ts";
import { factory as loseNode } from "../nodes/lose.ts";
import { factory as replayNode } from "../nodes/replay.ts";
import { factory as terminateNode } from "../nodes/terminate.ts";

export interface State {
  word: string;
  revealed: boolean[];
  wrongGuesses: number;
  maxWrong: number;
  guessedLetters: string[];
  gameOver: boolean;
}

type NodeId =
  | "game-start"
  | "display"
  | "guess"
  | "check"
  | "win"
  | "lose"
  | "replay"
  | "terminate";

const amble = ambler<State, NodeId>({
  "game-start": () => gameStartNode({ onReady: "display" }),
  display: () => displayNode({ onDisplay: "guess" }),
  guess: () => guessNode({ onValid: "check", onInvalid: "guess" }),
  check: () =>
    checkNode({ onWin: "win", onLose: "lose", onContinue: "display" }),
  win: () => winNode({ onWin: "replay" }),
  lose: () => loseNode({ onLose: "replay" }),
  replay: () => replayNode({ onContinue: "game-start", onQuit: "terminate" }),
  terminate: () => terminateNode({ onDone: null }),
});

const initialState: State = {
  word: "",
  revealed: [],
  wrongGuesses: 0,
  maxWrong: 6,
  guessedLetters: [],
  gameOver: false,
};

if (import.meta.main) {
  let nodeId: NodeId | null = "game-start";
  let state: State = initialState;

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
