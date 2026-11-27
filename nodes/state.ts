/**
 * The state registry: one `Has*` contract per field the nodes share. A node's
 * `State` extends the contracts it reads or writes, and declares no field of
 * its own.
 */

import type { Message } from "./prompt.ts";

/** The command-line arguments not yet consumed. */
export interface HasArgv {
  argv: string[];
}

/** The command `cli-route` took from `argv`, if any. */
export interface HasCommand {
  command?: string;
}

/** The process exit code the CLI ends with. */
export interface HasExitCode {
  exitCode: number;
}

/** The base URL of the OpenAI-compatible LLM host. */
export interface HasHost {
  host: string;
}

/** The chat so far. */
export interface HasMessages {
  messages: Message[];
}

/** The model the chat uses. */
export interface HasModel {
  model: string;
}
