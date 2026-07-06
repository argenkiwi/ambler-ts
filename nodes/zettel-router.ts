import { NodeFactory } from "../ambler.ts";

export interface State {
  action?: string;
  error?: string;
}

export type Edge =
  | "onSearch"
  | "onCreate"
  | "onGet"
  | "onUpdate"
  | "onDelete"
  | "onLink"
  | "onError";

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
    case "search":
      return [edges.onSearch, state];
    case "create":
      return [edges.onCreate, state];
    case "get":
      return [edges.onGet, state];
    case "update":
      return [edges.onUpdate, state];
    case "delete":
      return [edges.onDelete, state];
    case "link":
      return [edges.onLink, state];
    default: {
      const error = `Unknown action: ${action}`;
      utils.print(JSON.stringify({ error }));
      return [edges.onError, { ...state, error }];
    }
  }
};
