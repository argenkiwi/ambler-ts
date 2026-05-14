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
    let currentMessages = [...state.messages];
    let response = "";
    let isGuess = false;

    // Validation Loop
    while (true) {
      let messagesWithHint = [...currentMessages];
      if (state.questionCount >= 20) {
        messagesWithHint = [
          ...messagesWithHint,
          {
            role: "system",
            content: `CRITICAL: You have reached the 20 questions limit. You MUST only make a guess now. You have ${3 - state.guessCount} guesses remaining. A guess MUST start with "Is the answer ".`,
          } as Message,
        ];
      } else if (state.questionCount >= 15 || state.guessCount > 0) {
        messagesWithHint = [
          ...messagesWithHint,
          {
            role: "system",
            content: `HINT: You have asked ${state.questionCount}/20 questions and made ${state.guessCount}/3 guesses. ${
              20 - state.questionCount
            } questions and ${3 - state.guessCount} guesses remaining.`,
          } as Message,
        ];
      }

      response = await utils.chat(messagesWithHint, state.model, state.host);
      isGuess = response.toLowerCase().trim().startsWith("is the answer");

      if (state.questionCount >= 20 && !isGuess) {
        utils.print(`\nLLM attempted to ask a question after the limit: ${response}`);
        utils.print(`Re-prompting for a guess...`);
        // Add the invalid response and a correction message to the history for the NEXT loop iteration
        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: response } as Message,
          { role: "system", content: "Invalid move. You cannot ask more questions. You must make a guess." } as Message,
        ];
        continue;
      }

      break;
    }

    if (isGuess) {
      utils.print(`\nLLM (Guess ${state.guessCount + 1}): ${response}`);
    } else {
      utils.print(`\nLLM (Q ${state.questionCount + 1}): ${response}`);
    }

    const nextState = {
      ...state,
      messages: [
        ...state.messages, // We use the original state.messages here to avoid including the intermediate "correction" messages in the permanent state if possible, or we could use currentMessages if we want the model to remember its mistake.
        // Actually, it's better to use currentMessages to ensure the conversation remains coherent for the next node.
        ...currentMessages.slice(state.messages.length),
        { role: "assistant", content: response } as Message,
      ],
      questionCount: isGuess ? state.questionCount : state.questionCount + 1,
      guessCount: isGuess ? state.guessCount + 1 : state.guessCount,
    };

    return [edges.onSuccess, nextState];
  };
};
