import { NodeFactory } from "../ambler.ts";

export interface State {
  nbPoints: number;
  bet: number;
  symbols: string[];
}

export type Edge = "onSpin" | "onInvalid" | "onGameOver";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (edges, utils = defaultUtils) =>
  (state) => {
    utils.print(`Your points: ${state.nbPoints}`);
    const input = utils.readLine("Enter your bet: ");

    if (input === null || input === "") {
      utils.print("You chose to stop.");
      return [edges.onGameOver, state];
    }

    const bet = parseInt(input, 10);

    if (isNaN(bet)) {
      utils.print("Error: Please enter a valid number.");
      return [edges.onInvalid, state];
    }

    if (bet === 0) {
      utils.print("You chose to stop.");
      return [edges.onGameOver, state];
    }

    if (bet <= 0 || bet > state.nbPoints) {
      utils.print(`Error: Bet must be between 1 and ${state.nbPoints}.`);
      return [edges.onInvalid, state];
    }

    return [edges.onSpin, { ...state, bet }];
  };
