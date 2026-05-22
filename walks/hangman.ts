import { ambler } from "../ambler.ts";
import { factory as menuNode } from "../nodes/hangman-menu.ts";
import { factory as playNode } from "../nodes/hangman-play.ts";
import { factory as gameOverNode } from "../nodes/hangman-game-over.ts";

export interface State {
  word: string;
  guessed: string[];
  won: boolean;
}

type NodeId = "menu" | "play" | "gameOver";

const amble = ambler<State, NodeId>({
  menu: () => menuNode({ onPlay: "play", onExit: null }),
  play: () => playNode({ onGameOver: "gameOver", onExit: null }),
  gameOver: () => gameOverNode({ onPlayAgain: "menu", onExit: null }),
});

if (import.meta.main) {
  let nodeId: NodeId | null = "menu";
  let state: State = { word: "", guessed: [], won: false };

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
