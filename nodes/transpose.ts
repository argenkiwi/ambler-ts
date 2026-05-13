import { NodeFactory } from "../ambler.ts";
import { transpose as transposeText } from "../utils/troll.ts";
import { Message } from "./prompt.ts";

export interface State {
  messages: Message[];
}

export type Edge = "onComplete";

export type Utils = {
  transpose: (text: string) => string;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  transpose: transposeText,
  print: (msg: string) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    if (state.messages.length === 0) {
      return [edges.onComplete, state];
    }

    const lastIndex = state.messages.length - 1;
    const lastMsg = state.messages[lastIndex];

    if (lastMsg.role !== "user") {
      return [edges.onComplete, state];
    }

    const trolledContent = utils.transpose(lastMsg.content);

    const nextState = {
      ...state,
      messages: [
        ...state.messages.slice(0, lastIndex),
        { role: "user", content: trolledContent } as Message,
      ],
    };

    return [edges.onComplete, nextState];
  };
};
