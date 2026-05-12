import { NodeFactory } from "../ambler.ts";
import { Confirm } from "@cliffy/prompt";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onPlayAgain" | "onQuit";

export type Utils = {
  readLine: (msg: string) => Promise<boolean>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: async (msg) => await Confirm.prompt({ message: msg, default: false }),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
async (state) => {
  const input = await utils.readLine("Play again? (yes/no): ");

  if (input) {
    return [edges.onPlayAgain, { ...state, userChoice: null, computerChoice: null, result: null }];
  }

  utils.print("Thanks for playing!");
  return [edges.onQuit, state];
};
