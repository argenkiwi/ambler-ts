/**
 * The guides `bun run ambler help [topic]` prints. Embedded as text imports, so they ship with
 * the CLI that enforces them and resolve from `node_modules` like the rest of the package.
 */
import check from "./check.md" with { type: "text" };
import conventions from "./conventions.md" with { type: "text" };
import general from "./general.md" with { type: "text" };
import node from "./node.md" with { type: "text" };
import nodeDesign from "./node-design.md" with { type: "text" };
import spec from "./spec.md" with { type: "text" };
import testing from "./testing.md" with { type: "text" };
import util from "./util.md" with { type: "text" };
import walk from "./walk.md" with { type: "text" };

const GUIDES: Record<string, string> = {
  node,
  util,
  walk,
  check,
  conventions,
  "node-design": nodeDesign,
  testing,
  spec,
};

/** Every topic `help <topic>` knows: the verbs, then the conventions behind them. */
export const TOPICS = Object.keys(GUIDES);

/** The guide for `topic`, or the general guide for none. */
export function guide(topic?: string): string | undefined {
  if (topic === undefined || topic === "") return general;
  return Object.hasOwn(GUIDES, topic) ? GUIDES[topic] : undefined;
}
