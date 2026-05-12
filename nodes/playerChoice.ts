import { NodeFactory } from "../ambler.ts";

export interface State {
  playerHealth: number;
  cpuHealth: number;
  playerMove: string | null;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  print: (msg: string) => void;
  readLine: (msg: string) => string | null;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  readLine: (msg) => prompt(msg),
};

const VALID_MOVES = ["k", "p", "s", "c", "b", "j"];

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  utils.print(`\nPlayer: ${state.playerHealth} HP | CPU: ${state.cpuHealth} HP`);
  const input = utils.readLine("Choose your move (k: kick, p: punch, s: sweep, c: crouch, b: block, j: jump): ");

  const move = input?.toLowerCase().trim();

  if (move && VALID_MOVES.includes(move)) {
    const moveMap: Record<string, string> = {
      k: "kick",
      p: "punch",
      s: "sweep",
      c: "crouch",
      b: "block",
      j: "jump",
    };
    return [edges.onSuccess, { ...state, playerMove: moveMap[move] }];
  }

  utils.print("Invalid move! Please choose one of: k, p, s, c, b, j.");
  return [edges.onError, state];
};
