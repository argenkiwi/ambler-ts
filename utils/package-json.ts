/** Pure edits of a project's `package.json` text. */

/**
 * `packageJson` with a `"<name>": "bun walks/<name>.ts"` script, placed in
 * alphabetical order among the scripts after the built-in `test`, `check`
 * and `lint`. Edits lines rather than re-serialising, so the rest of the
 * file keeps its layout. `null` if the script is already there or there is
 * no `"scripts"` object.
 */
export function addWalkScript(
  packageJson: string,
  name: string,
): string | null {
  const key = `"${name}":`;
  const lines = packageJson.split("\n");
  const start = lines.findIndex((l) => l.trimStart().startsWith('"scripts":'));
  if (start < 0) return null;
  const close = lines
    .slice(start)
    .findIndex((l) => l.trimStart().startsWith("}"));
  if (close < 0) return null;
  const end = start + close;
  const body = lines.slice(start + 1, end);
  if (body.some((l) => l.trimStart().startsWith(key))) return null;

  const indent = body[0]?.match(/^\s*/)?.[0] ?? "    ";
  const builtin = ['"test":', '"check":', '"lint":'];
  const index = body.findIndex((l) => {
    const t = l.trimStart();
    return !builtin.some((b) => t.startsWith(b)) && t > key;
  });
  const at = index < 0 ? end : start + 1 + index;
  // The line before the new one needs a comma, and the new one needs one
  // unless it is last.
  if (
    at === end &&
    end > start + 1 &&
    !lines[end - 1].trimEnd().endsWith(",")
  ) {
    lines[end - 1] = `${lines[end - 1].trimEnd()},`;
  }
  const comma = at === end ? "" : ",";
  lines.splice(at, 0, `${indent}"${name}": "bun walks/${name}.ts"${comma}`);
  return lines.join("\n");
}
