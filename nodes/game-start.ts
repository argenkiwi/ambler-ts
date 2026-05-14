import { NodeFactory } from "../ambler.ts";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface State {
  messages: Message[];
  questionCount: number;
  guessCount: number;
}

export type Edge = "onSuccess";

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
    utils.print("\n=== 20 Questions Game ===");
    utils.print("Think of an object, and I will try to guess it.");
    utils.print("Rules: I have 20 questions and 3 guesses.");
    utils.print("If I reach 20 questions, I can still use my remaining guesses.");
    utils.print("Please answer with 'yes', 'no', 'sometimes', or 'maybe'.\n");

    const systemPrompt: Message = {
      role: "system",
      content: "You are playing a game of 20 Questions. Your goal is to guess the object the user is thinking of. " +
        "Rules:\n" +
        "1. You can ask up to 20 yes/no questions.\n" +
        "2. You can make up to 3 guesses.\n" +
        "3. A guess MUST start with 'Is the answer ' (e.g., 'Is the answer a toaster?').\n" +
        "4. Guesses do NOT count towards your 20 questions limit.\n" +
        "5. If you reach 20 questions, you MUST only make guesses. You cannot ask more questions.\n" +
        "6. The game ends if you guess correctly or use up all questions AND all guesses.\n" +
        "Ask one question at a time. Be strategic!",
    };

    return [
      edges.onSuccess,
      {
        ...state,
        messages: [systemPrompt],
        questionCount: 0,
        guessCount: 0,
      },
    ];
  };
};
