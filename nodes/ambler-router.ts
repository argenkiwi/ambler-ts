import { NodeFactory } from "../ambler.ts";

export interface State {
  action?: string;
  error?: string;
}

export type Edge = "onInit" | "onClone" | "onError";

export type Utils = {
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
};

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) =>
(state) => {
  const { action } = state;
  if (!action) {
    const error = "No action specified";
    utils.print(JSON.stringify({ error }));
    return [edges.onError, { ...state, error }];
  }

  switch (action.toLowerCase()) {
    case "init":
      return [edges.onInit, state];
    case "clone":
      return [edges.onClone, state];
    default: {
      const error = `Unknown action: ${action}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onError, { ...state, error }];
    }
  }
};
