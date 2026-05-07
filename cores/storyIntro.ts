export interface Output {
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

export const factory = <N extends string | null>(
  edges: Record<Edge, N>,
  utils = defaultUtils,
) =>
(): [N, Output] => {
  const identity = utils.readLine("Who is the protagonist? ");
  const placement = utils.readLine(
    "Where and when does the story take place? ",
  );
  const circumstances = utils.readLine("What is happening? ");

  if (identity === null || placement === null || circumstances === null) {
    return [edges.onCancel, {
      identity: "",
      placement: "",
      circumstances: "",
    }];
  }

  return [edges.onIntroComplete, {
    identity: identity.trim(),
    placement: placement.trim(),
    circumstances: circumstances.trim(),
  }];
};
