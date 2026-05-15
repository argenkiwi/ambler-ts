import { NodeFactory } from "../ambler.ts";

export interface State {
  nbPoints: number;
  bet: number;
  symbols: string[];
}

export type Edge = "onBet" | "onGameOver";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (edges, utils = defaultUtils) =>
  (state) => {
    const [a, b, c] = state.symbols;

    if (a === b && b === c) {
      // Jackpot: 3 identical
      const score = state.bet * 10;
      utils.print(`🎰 JACKPOT! Triple ${a}! You won ${score} points!`);
      const nbPoints = state.nbPoints + score;
      if (nbPoints > 0) {
        return [edges.onBet, { ...state, nbPoints }];
      } else {
        return [edges.onGameOver, { ...state, nbPoints: 0 }];
      }
    } else if (a === b || b === c || a === c) {
      // Two identical
      const score = state.bet * 2;
      utils.print(`🎰 Two match! Two of ${a}. You won ${score} points!`);
      const nbPoints = state.nbPoints + score;
      if (nbPoints > 0) {
        return [edges.onBet, { ...state, nbPoints }];
      } else {
        return [edges.onGameOver, { ...state, nbPoints: 0 }];
      }
    } else {
      // Nothing matched
      utils.print(`😢 No match. You lost ${state.bet} points.`);
      const nbPoints = state.nbPoints - state.bet;
      if (nbPoints > 0) {
        return [edges.onBet, { ...state, nbPoints }];
      } else {
        return [edges.onGameOver, { ...state, nbPoints: 0 }];
      }
    }
  };
