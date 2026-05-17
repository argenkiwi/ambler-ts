import { run as init } from "./walks/init.ts";
import { run as clone } from "./walks/clone.ts";

const [command, ...args] = Deno.args;

switch (command) {
  case "init":
    await init(args);
    break;
  case "clone":
    await clone(args);
    break;
  default:
    console.error("Usage: ambler <command> [args]");
    console.error("  ambler init <target-dir>");
    console.error("  ambler clone <source-walk> <target-dir>");
    Deno.exit(1);
}
