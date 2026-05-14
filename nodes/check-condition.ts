import { NodeFactory } from "../ambler.ts";
import { Message } from "./game-start.ts";

export interface State {
  messages: Message[];
  questionCount: number;
  outcome?: "win" | "loss" | "quit";
}

export type Edge = "onContinue" | "onWin" | "onLoss";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const lastUserMsg = state.messages[state.messages.length - 1].content.toLowerCase().trim();
    const lastAssistantMsg = state.messages[state.messages.length - 2].content.toLowerCase();

    // A simple heuristic for winning:
    // 1. User says something explicitly victorious.
    // 2. User says "yes" and the assistant was making a guess (starting with "Is the answer").
    const winKeywords = ["correct", "got it", "guessed it", "that's it", "you win", "yes!", "exactly"];
    const isExplicitWin = winKeywords.some((k) => lastUserMsg.includes(k));
    const isGuess = lastAssistantMsg.startsWith("is the answer");
    
    const isYesToGuess = (lastUserMsg === "yes" || lastUserMsg === "y") && isGuess;

    if (isExplicitWin || isYesToGuess) {
      return [edges.onWin, { ...state, outcome: "win" }];
    }

    if (state.questionCount >= 20) {
      return [edges.onLoss, { ...state, outcome: "loss" }];
    }

    return [edges.onContinue, state];
  };
};
