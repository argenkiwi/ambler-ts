import { NodeFactory } from "../ambler.ts";
import { Confirm } from "@cliffy/prompt";

export interface State {
  playerHealth: number;
  cpuHealth: number;
  playerMove: string | null;
  cpuMove: string | null;
  outcome: string | null;
}

export type Edge = "onPlayAgain" | "onQuit";

export type Utils = {
  confirm: (msg: string) => Promise<boolean>;
};

const defaultUtils: Utils = {
  confirm: async (msg) => await Confirm.prompt({ message: msg, default: false }),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const answer = await utils.confirm("Would you like to play again?");

  if (answer) {
    return [edges.onPlayAgain, { 
      ...state, 
      playerHealth: 10, 
      cpuHealth: 10, 
      playerMove: null, 
      cpuMove: null, 
      outcome: null 
    }];
  }

  return [edges.onQuit, state];
};
