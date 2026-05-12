import { NodeFactory } from "../ambler.ts";

export interface State {
  playerHealth: number;
  cpuHealth: number;
  playerMove: string | null;
  cpuMove: string | null;
  outcome: string | null;
}

export type Edge = "onSuccess";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

type OutcomeKey = "Win" | "Trade" | "Lose" | "Chip" | "Ouch" | "Dodge" | "Miss" | "Draw";

const OUTCOME_VALUES: Record<OutcomeKey, [number, number]> = {
  Win: [0, -2],
  Trade: [-1, -1],
  Lose: [-2, 0],
  Chip: [0, -1],
  Ouch: [-1, 0],
  Dodge: [1, 0],
  Miss: [0, 1],
  Draw: [0, 0],
};

const COMPARISON_MATRIX: Record<string, Record<string, OutcomeKey>> = {
  kick: {
    kick: "Trade",
    punch: "Win",
    sweep: "Lose",
    crouch: "Miss",
    block: "Draw",
    jump: "Chip",
  },
  punch: {
    kick: "Lose",
    punch: "Trade",
    sweep: "Win",
    crouch: "Chip",
    block: "Miss",
    jump: "Draw",
  },
  sweep: {
    kick: "Win",
    punch: "Lose",
    sweep: "Trade",
    crouch: "Draw",
    block: "Chip",
    jump: "Miss",
  },
  crouch: {
    kick: "Dodge",
    punch: "Ouch",
    sweep: "Draw",
    crouch: "Draw",
    block: "Draw",
    jump: "Draw",
  },
  block: {
    kick: "Draw",
    punch: "Dodge",
    sweep: "Ouch",
    crouch: "Draw",
    block: "Draw",
    jump: "Draw",
  },
  jump: {
    kick: "Ouch",
    punch: "Draw",
    sweep: "Dodge",
    crouch: "Draw",
    block: "Draw",
    jump: "Draw",
  },
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const pMove = state.playerMove!.toLowerCase();
  const cMove = state.cpuMove!.toLowerCase();

  utils.print(`You used ${pMove.toUpperCase()}, CPU used ${cMove.toUpperCase()}.`);

  const outcome = COMPARISON_MATRIX[pMove][cMove];
  const [pDelta, cDelta] = OUTCOME_VALUES[outcome];

  const messages: Record<OutcomeKey, string> = {
    Win: "You hit the CPU! It takes 2 damage.",
    Lose: "CPU hits you! You take 2 damage.",
    Trade: "You both hit each other! Both take 1 damage.",
    Chip: "You chip the CPU! It takes 1 damage.",
    Ouch: "CPU chips you! You take 1 damage.",
    Dodge: "You dodged! You recover 1 HP.",
    Miss: "You missed! CPU recovers 1 HP.",
    Draw: "It's a draw! No damage dealt.",
  };

  utils.print(messages[outcome]);

  const newPlayerHealth = Math.max(0, Math.min(10, state.playerHealth + pDelta));
  const newCpuHealth = Math.max(0, Math.min(10, state.cpuHealth + cDelta));

  return [
    edges.onSuccess,
    {
      ...state,
      playerHealth: newPlayerHealth,
      cpuHealth: newCpuHealth,
      outcome,
    },
  ];
};
