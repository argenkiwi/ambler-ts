import { NodeFactory } from "../ambler.ts";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface State {
  messages: Message[];
  questionCount: number;
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
    utils.print("Think of an object, and I will try to guess it in 20 questions or less.");
    utils.print("Please answer with 'yes', 'no', 'sometimes', or 'maybe'.\n");

    const systemPrompt: Message = {
      role: "system",
      content: "You are playing a game of 20 Questions. Your goal is to guess the object the user is thinking of by asking up to 20 yes/no questions. Ask one question at a time. If you are making a final guess for the object, you MUST start your message with 'Is the answer ' (e.g., 'Is the answer a toaster?'). Otherwise, just ask a property question.",
    };

    return [
      edges.onSuccess,
      {
        ...state,
        messages: [systemPrompt],
        questionCount: 0,
      },
    ];
  };
};
