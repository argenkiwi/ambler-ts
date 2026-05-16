import { NodeFactory } from "../ambler.ts";

export interface State {
  isNewProject?: boolean;
  error?: string;
}

export type Edge = "onNewProject" | "onExisting";

export const factory: NodeFactory<State, Edge> = (edges) => {
  return (state) => {
    return [state.isNewProject ? edges.onNewProject : edges.onExisting, state];
  };
};
