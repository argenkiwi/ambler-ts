import { NodeFactory } from "../ambler.ts";
import { getPrompt } from "../utils/prompt.ts";

export interface State {
  identity: string;
  placement: string;
  circumstances: string;
}

export type Edge = "onComplete" | "onCancel";

export type Utils = {
  getPrompt: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  getPrompt,
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const identity = utils.getPrompt(
      "Who is the protagonist? ",
    );
    if (!identity) {
      return [edges.onCancel, state];
    }

    const placement = utils.getPrompt(
      "Where and when does the story take place? ",
    );
    if (!placement) {
      return [edges.onCancel, state];
    }

    const circumstances = utils.getPrompt(
      "What situation does the protagonist find themselves in? ",
    );
    if (!circumstances) {
      return [edges.onCancel, state];
    }

    return [
      edges.onComplete,
      { ...state, identity, placement, circumstances },
    ];
  };
};
