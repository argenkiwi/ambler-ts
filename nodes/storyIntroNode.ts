import { defaultPrint, defaultReadLine, next, Nextable } from "../ambler.ts";

export interface State {
  identity: string;
  placement: string;
  circumstances: string;
}

export type Edges<S extends State> = {
  onIntroComplete: Nextable<S>;
};

export type Utils = {
  readLine: (msg: string) => Promise<string | null>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: defaultReadLine,
  print: defaultPrint,
};

export const create =
  <S extends State>(edges: Edges<S>, utils: Utils = defaultUtils) =>
  async (state: S) => {
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
