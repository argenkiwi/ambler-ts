/** Pure name-case conversions used when scaffolding. */

export function toKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_]/g, "-")
    .toLowerCase();
}

export function toCamel(s: string): string {
  const parts = toKebab(s).split("-").filter(Boolean);
  if (parts.length === 0) return "";
  return (
    parts[0] +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

export function toPascal(s: string): string {
  const c = toCamel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function toEdge(s: string): string {
  const c = toCamel(s);
  if (c.startsWith("on") && c.length > 2 && c[2] === c[2].toUpperCase()) {
    return c;
  }
  return `on${toPascal(s)}`;
}

export function toShout(s: string): string {
  return toKebab(s).replace(/-/g, "_").toUpperCase();
}
