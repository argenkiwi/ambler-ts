import { next, Node } from "../ambler.ts";

export interface State {
  identity: string;
  placement: string;
  circumstances: string;
}

export type Edges<S extends State> = {
  onIntroComplete: Node<S>;
};

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return (state: S) => {
    const identity = utils.readLine("Who is the protagonist? ");
    const placement = utils.readLine(
      "Where and when does the story take place? ",
    );
    const circumstances = utils.readLine("What is happening? ");

    if (identity === null || placement === null || circumstances === null) {
      return null;
    }

    return next(edges.onIntroComplete, {
      ...state,
      identity: identity.trim(),
      placement: placement.trim(),
      circumstances: circumstances.trim(),
    });
  };
}
