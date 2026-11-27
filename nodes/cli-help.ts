import type { NodeFactory } from "../ambler.ts";
import { guide, TOPICS } from "../guides/index.ts";
import type { HasArgv, HasCommand, HasExitCode } from "./state.ts";

export interface State extends HasCommand, HasArgv, HasExitCode {}

export type Edge = "onDone";

export type Utils = {
  print: (msg: string) => void;
  printError: (msg: string) => void;
};

const defaultUtils: Utils = {
  print: (msg) => console.log(msg),
  printError: (msg) => console.error(msg),
};

export const USAGE = `Usage: bun run ambler <command> [options]

Commands:
  node <name> (--outcomes <a,b> | --terminal) [--state <field>[:<Type>]]...
  walk <name> --nodes <n1,n2> [--edge <e=t>] [--no-runner]
  util <name>
  check [--lint-only]
  help [topic]
`;

export const factory: NodeFactory<State, Edge, Utils> =
  (edges, utils = defaultUtils) =>
  (state) => {
    if (state.command !== "help") {
      utils.print(USAGE);
      return [edges.onDone, state];
    }
    const topic = state.argv[0];
    const text = guide(topic);
    if (text === undefined) {
      utils.printError(`No guide for ${topic}. Topics: ${TOPICS.join(", ")}`);
      return [edges.onDone, { ...state, exitCode: 1 }];
    }
    utils.print(text);
    return [edges.onDone, state];
  };
