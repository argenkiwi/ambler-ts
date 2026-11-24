import { ambler, walk } from "../ambler.ts";
import type { Utils as CliErrorUtils } from "../nodes/cli-error.ts";
import defer * as cliErrorNode from "../nodes/cli-error.ts";
import type { Utils as CliHelpUtils } from "../nodes/cli-help.ts";
import defer * as cliHelpNode from "../nodes/cli-help.ts";
import defer * as cliRouteNode from "../nodes/cli-route.ts";
import type { Utils as RunChecksUtils } from "../nodes/run-checks.ts";
import defer * as runChecksNode from "../nodes/run-checks.ts";
import type { Utils as ScaffoldNodeUtils } from "../nodes/scaffold-node.ts";
import defer * as scaffoldNodeNode from "../nodes/scaffold-node.ts";
import type { Utils as ScaffoldUtilUtils } from "../nodes/scaffold-util.ts";
import defer * as scaffoldUtilNode from "../nodes/scaffold-util.ts";
import type { Utils as ScaffoldWalkUtils } from "../nodes/scaffold-walk.ts";
import defer * as scaffoldWalkNode from "../nodes/scaffold-walk.ts";

export interface State {
  argv: string[];
  command?: string;
  exitCode: number;
}

export type NodeId =
  | "CLI_ROUTE"
  | "SCAFFOLD_NODE"
  | "SCAFFOLD_WALK"
  | "SCAFFOLD_UTIL"
  | "RUN_CHECKS"
  | "CLI_HELP"
  | "CLI_ERROR";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  scaffoldNode?: ScaffoldNodeUtils;
  scaffoldWalk?: ScaffoldWalkUtils;
  scaffoldUtil?: ScaffoldUtilUtils;
  runChecks?: RunChecksUtils;
  cliHelp?: CliHelpUtils;
  cliError?: CliErrorUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    CLI_ROUTE: () =>
      cliRouteNode.factory({
        onNode: "SCAFFOLD_NODE",
        onWalk: "SCAFFOLD_WALK",
        onUtil: "SCAFFOLD_UTIL",
        onCheck: "RUN_CHECKS",
        onHelp: "CLI_HELP",
        onUnknown: "CLI_ERROR",
      }),
    SCAFFOLD_NODE: () =>
      scaffoldNodeNode.factory(
        { onDone: null, onError: null },
        utils.scaffoldNode,
      ),
    SCAFFOLD_WALK: () =>
      scaffoldWalkNode.factory(
        { onDone: null, onError: null },
        utils.scaffoldWalk,
      ),
    SCAFFOLD_UTIL: () =>
      scaffoldUtilNode.factory(
        { onDone: null, onError: null },
        utils.scaffoldUtil,
      ),
    RUN_CHECKS: () =>
      runChecksNode.factory({ onDone: null, onError: null }, utils.runChecks),
    CLI_HELP: () => cliHelpNode.factory({ onDone: null }, utils.cliHelp),
    CLI_ERROR: () => cliErrorNode.factory({ onDone: null }, utils.cliError),
  });
}

/** Runs the CLI for `argv` and returns the process exit code. */
export async function run(argv: string[]): Promise<number> {
  const final = await walk(createWalk(), "CLI_ROUTE", { argv, exitCode: 0 });
  return final.exitCode;
}

if (import.meta.main) {
  process.exit(await run(process.argv.slice(2)));
}
