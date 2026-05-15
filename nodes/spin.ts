import { NodeFactory } from "../ambler.ts";

export interface State {
  nbPoints: number;
  bet: number;
  symbols: string[];
}

export type Edge = "onResult";

export type Utils = {
  print: (msg: string) => void;
  sleep: (ms: number) => Promise<void>;
  random: () => number;
};

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "⚡"];

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  random: () => Math.random(),
};

export const factory: NodeFactory<State, Edge, Utils> = (edges, utils = defaultUtils) =>
  async (state) => {
    const symbols: string[] = [];

    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(utils.random() * SYMBOLS.length);
      symbols.push(SYMBOLS[idx]);
    }

    utils.print(">>> SPIN <<<");
    await utils.sleep(400);
    for (const symbol of symbols) {
      utils.print(`   ${symbol}`);
      await utils.sleep(400);
    }

    return [edges.onResult, { ...state, symbols }];
  };
