import { NodeFactory } from "../ambler.ts";

export interface State {
  identity: string;
  placement: string;
  circumstances: string;
}

export type Edge = "onIntroComplete" | "onCancel";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

const create: NodeFactory<Edge, Utils, State> = (
  edges,
  utils = defaultUtils,
) => {
  return (state) => {
    const identity = utils.readLine("Who is the protagonist? ");
    const placement = utils.readLine(
      "Where and when does the story take place? ",
    );
    const circumstances = utils.readLine("What is happening? ");

    if (identity === null || placement === null || circumstances === null) {
      return [edges.onCancel, state];
    }

    return [edges.onIntroComplete, {
      ...state,
      identity: identity.trim(),
      placement: placement.trim(),
      circumstances: circumstances.trim(),
    }];
  };
};

export default create;
