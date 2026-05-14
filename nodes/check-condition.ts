import { NodeFactory } from "../ambler.ts";
import { Message } from "./game-start.ts";

export interface State {
  messages: Message[];
  questionCount: number;
  guessCount: number;
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

    const isGuess = lastAssistantMsg.startsWith("is the answer");
    
    // Win conditions:
    // 1. User says something explicitly victorious.
    // 2. User says "yes" and the assistant was making a guess.
    const winKeywords = ["correct", "got it", "guessed it", "that's it", "you win", "exactly"];
    const isExplicitWin = winKeywords.some((k) => lastUserMsg.includes(k));
    const isYesToGuess = (lastUserMsg === "yes" || lastUserMsg === "y") && isGuess;

    if (isExplicitWin || isYesToGuess) {
      return [edges.onWin, { ...state, outcome: "win" }];
    }

    // Loss conditions:
    // 1. Question count reached 20 and no guesses left.
    // 2. Guess count reached 3 and the last guess was incorrect.
    
    if (state.questionCount >= 20 && state.guessCount >= 3) {
      utils.print("\nYou've reached both the 20 questions and 3 guesses limit!");
      return [edges.onLoss, { ...state, outcome: "loss" }];
    }

    if (isGuess && state.guessCount >= 3) {
      // If we just made the 3rd guess and it wasn't a win, it's a loss.
      utils.print("\nThat was your 3rd and final guess!");
      return [edges.onLoss, { ...state, outcome: "loss" }];
    }

    return [edges.onContinue, state];
  };
};
