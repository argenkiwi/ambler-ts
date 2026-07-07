#!/bin/sh
# Shared helper for build.sh / install.sh: prints the --allow-*/-A permission
# flags for a walk, taken from the same-named task in deno.json, e.g.
# "zettel": "deno run --allow-read --allow-write --allow-net walks/zettel.ts"
# -> "--allow-read --allow-write --allow-net"
# Prints nothing if there's no matching task (caller should warn).
permissions_for_walk() {
  deno eval "
    const cfg = JSON.parse(Deno.readTextFileSync('deno.json'));
    const task = cfg.tasks && cfg.tasks['$1'];
    if (!task) { console.log(''); Deno.exit(0); }
    const flags = task.split(/\s+/).filter((p) => p.startsWith('--allow') || p === '-A');
    console.log(flags.join(' '));
  "
}
