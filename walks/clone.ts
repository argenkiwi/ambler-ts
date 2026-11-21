import { ambler, walk } from "../ambler.ts";
import type { Utils as AnalyzeUtils } from "../nodes/clone-analyze.ts";
import defer * as analyzeNode from "../nodes/clone-analyze.ts";
import type { Utils as ConfigUtils } from "../nodes/clone-config.ts";
import defer * as configNode from "../nodes/clone-config.ts";
import type { Utils as CopyUtils } from "../nodes/clone-copy.ts";
import defer * as copyNode from "../nodes/clone-copy.ts";
import type { Utils as SetupUtils } from "../nodes/clone-setup.ts";
import defer * as setupNode from "../nodes/clone-setup.ts";
import type { Utils as StopUtils } from "../nodes/clone-stop.ts";
import defer * as stopNode from "../nodes/clone-stop.ts";
import type { Utils as InitConfigUtils } from "../nodes/init-config.ts";
import defer * as initConfigNode from "../nodes/init-config.ts";
import type { Utils as InitCopyUtils } from "../nodes/init-copy.ts";
import defer * as initCopyNode from "../nodes/init-copy.ts";
import type { Utils as InitSetupUtils } from "../nodes/init-setup.ts";
import defer * as initSetupNode from "../nodes/init-setup.ts";

export interface State {
  sourceWalkPath: string;
  targetDir: string;
  sourceRoot: string;
  walkName: string;
  artifactType: "walk" | "node" | "util";
  filesToCopy: string[];
  externalDeps?: Record<string, string>;
  isNewProject: boolean;
  error?: string;
}

export type NodeId =
  | "SETUP"
  | "ANALYZE"
  | "INIT_SETUP"
  | "INIT_COPY"
  | "INIT_CONFIG"
  | "COPY"
  | "CONFIG"
  | "STOP";

/** Per-node utils overrides; omitted nodes use their defaults. */
export type WalkUtils = {
  setup?: SetupUtils;
  analyze?: AnalyzeUtils;
  initSetup?: InitSetupUtils;
  initCopy?: InitCopyUtils;
  initConfig?: InitConfigUtils;
  copy?: CopyUtils;
  config?: ConfigUtils;
  stop?: StopUtils;
};

export function createWalk(utils: WalkUtils = {}) {
  return ambler<State, NodeId>({
    SETUP: () =>
      setupNode.factory(
        {
          onNewProject: "INIT_SETUP",
          onExisting: "ANALYZE",
          onError: "STOP",
        },
        utils.setup,
      ),
    ANALYZE: () =>
      analyzeNode.factory(
        { onSuccess: "COPY", onError: "STOP" },
        utils.analyze,
      ),
    INIT_SETUP: () =>
      initSetupNode.factory(
        { onSuccess: "INIT_COPY", onError: "STOP" },
        utils.initSetup,
      ),
    INIT_COPY: () =>
      initCopyNode.factory(
        { onSuccess: "INIT_CONFIG", onError: "STOP" },
        utils.initCopy,
      ),
    INIT_CONFIG: () =>
      initConfigNode.factory(
        { onSuccess: "ANALYZE", onError: "STOP" },
        utils.initConfig,
      ),
    COPY: () =>
      copyNode.factory({ onSuccess: "CONFIG", onError: "STOP" }, utils.copy),
    CONFIG: () =>
      configNode.factory({ onSuccess: "STOP", onError: "STOP" }, utils.config),
    STOP: () => stopNode.factory({ onDone: null }, utils.stop),
  });
}

export function initialState(sourceWalkPath: string, targetDir: string): State {
  return {
    sourceWalkPath,
    targetDir,
    sourceRoot: "",
    walkName: "",
    artifactType: "walk",
    filesToCopy: [],
    isNewProject: false,
  };
}

if (import.meta.main) {
  const [sourceWalkPath, targetDir] = process.argv.slice(2);

  if (!sourceWalkPath || !targetDir) {
    console.error("Usage: bun walks/clone.ts <source-path> <target-dir>");
    process.exit(1);
  }

  const final = await walk(
    createWalk(),
    "SETUP",
    initialState(sourceWalkPath, targetDir),
  );
  if (final.error) process.exit(1);
}
