// init.ts — Bootstrap a new Ambler project
//
// Usage:
//   deno run --allow-write --allow-read init.ts <target-dir>

const targetDir = Deno.args[0];

if (!targetDir) {
  console.error(
    "Usage: deno run --allow-write --allow-read init.ts <target-dir>",
  );
  Deno.exit(1);
}

// Validate target directory
try {
  const stat = await Deno.stat(targetDir);
  if (!stat.isDirectory) {
    console.error(`Error: "${targetDir}" exists and is not a directory.`);
    Deno.exit(1);
  }
} catch {
  // Does not exist — will be created
}

// Create directory structure
const dirs = [
  targetDir,
  `${targetDir}/nodes/tests`,
  `${targetDir}/walks`,
  `${targetDir}/specs`,
  `${targetDir}/utils`,
];

for (const dir of dirs) {
  await Deno.mkdir(dir, { recursive: true });
}

// ─── File contents ───────────

const DENO_JSON = `{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19"
  }
}
`;

// ─── Write files ─────────────

console.log(`Initializing ambler project in "${targetDir}"...`);

// Copy ambler.ts from the script's location
const amblerSrc = new URL("ambler.ts", import.meta.url).pathname;
try {
  await Deno.copyFile(amblerSrc, `${targetDir}/ambler.ts`);
  console.log(`  Created: ambler.ts (copied)`);
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log(err.message);
  } else {
    console.log("Failed to copy ambler.ts:", err);
  }

  Deno.exit(1);
}

// Write deno.json
await Deno.writeTextFile(`${targetDir}/deno.json`, DENO_JSON);
console.log(`  Created: deno.json`);

console.log(`\nDone! Run "deno check ${targetDir}/ambler.ts" to verify.`);
