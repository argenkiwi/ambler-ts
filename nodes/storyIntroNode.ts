import { MaybePromise, next, Nextable } from "../ambler.ts";
import { defaultPrint } from "../utils/defaultPrint.ts";
import { defaultReadLine } from "../utils/defaultReadLine.ts";

export interface State {
  identity: string;
  placement: string;
  circumstances: string;
}

export type Edges<S extends State> = {
  onIntroComplete: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => MaybePromise<string | null>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: defaultReadLine,
  print: defaultPrint,
};

export function create<S extends State>(
  edges: Edges<S>,
  utils: Utils = defaultUtils,
) {
  return async (state: S) => {
    const identity = await utils.readLine("Who is the protagonist? ");
    const placement = await utils.readLine(
      "Where and when does the story take place? ",
    );
    const circumstances = await utils.readLine("What is happening? ");

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
