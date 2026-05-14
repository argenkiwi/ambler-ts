import { NodeFactory } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";
import { Message } from "./game-start.ts";

export interface State {
  messages: Message[];
  host: string;
  model: string;
  questionCount: number;
  guessCount: number;
}

export type Edge = "onSuccess";

export type Utils = {
  chat: (messages: Message[], model: string, host: string) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: (messages, model, host) => ollamaChat(messages, model, host),
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    let messages = [...state.messages];
    if (state.questionCount >= 15 || state.guessCount > 0) {
      messages = [
        ...messages,
        {
          role: "system",
          content: `HINT: You have asked ${state.questionCount}/20 questions and made ${state.guessCount}/3 guesses. ${
            20 - state.questionCount
          } questions and ${3 - state.guessCount} guesses remaining.`,
        } as Message,
      ];
    }

    const response = await utils.chat(messages, state.model, state.host);
    const isGuess = response.toLowerCase().trim().startsWith("is the answer");

    if (isGuess) {
      utils.print(`\nLLM (Guess ${state.guessCount + 1}): ${response}`);
    } else {
      utils.print(`\nLLM (Q ${state.questionCount + 1}): ${response}`);
    }

    const nextState = {
      ...state,
      messages: [
        ...state.messages,
        { role: "assistant", content: response } as Message,
      ],
      questionCount: isGuess ? state.questionCount : state.questionCount + 1,
      guessCount: isGuess ? state.guessCount + 1 : state.guessCount,
    };

    return [edges.onSuccess, nextState];
  };
};
