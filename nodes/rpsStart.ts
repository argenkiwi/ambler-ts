import { Select } from "@cliffy/prompt";
import { NodeFactory } from "../ambler.ts";

export interface State {
  userChoice: string | null;
  computerChoice: string | null;
  result: string | null;
}

export type Edge = "onSuccess" | "onError";

export type Utils = {
  selectChoice: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const validChoices = ["rock", "paper", "scissors"];
const defaultUtils: Utils = {
  selectChoice: async (msg: string) => await Select.prompt({
    message: msg,
    options: validChoices.map((choice) => ({
      name: choice.charAt(0).toUpperCase() + choice.slice(1),
      value: choice
    })),
  }),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
  async (state) => {
    try {
      const choice = await utils.selectChoice("Choose your weapon:");

      if (choice === null || !validChoices.includes(choice)) {
        return [edges.onError, state];
      }

      return [edges.onSuccess, { ...state, userChoice: choice }];
    } catch {
      return [edges.onError, state];
    }
  };
