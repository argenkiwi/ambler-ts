import { amble, node } from "./ambler.ts";
import { State } from "./state.ts";
import { start } from "./nodes/start.ts";
import { count } from "./nodes/count.ts";
import { stop } from "./nodes/stop.ts";

const initialState: State = {
  count: 0,
};

const startNode = node(() => start({ onCount: countNode, onInvalid: startNode }));
const countNode = node(() => count({ onCount: countNode, onStop: stopNode }));
const stopNode = node(() => stop());

if (import.meta.main) {
  await amble(startNode, initialState);
}
