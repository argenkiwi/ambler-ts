#!/bin/sh
# Cross-compiles a walk into standalone binaries for every platform Deno
# supports, under dist/. Usage: scripts/build.sh [walk-name] (default: ambler)
set -eu

cd "$(dirname "$0")/.."
. "$(dirname "$0")/_permissions.sh"

name="${1:-ambler}"

case "$name" in
  *[!A-Za-z0-9_-]*|"") echo "Invalid walk name: '$name'" >&2; exit 1 ;;
esac

if [ ! -f "walks/${name}.ts" ]; then
  echo "No such walk: walks/${name}.ts" >&2
  exit 1
fi

perms="$(permissions_for_walk "$name")"
if [ -z "$perms" ]; then
  echo "Note: no '${name}' task found in deno.json — compiling with no extra permissions." >&2
fi

TARGETS="x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin"

mkdir -p dist

for target in $TARGETS; do
  ext=""
  case "$target" in
    *windows*) ext=".exe" ;;
  esac
  output="dist/${name}-${target}${ext}"
  echo "Building ${output}..."
  deno compile $perms --target "$target" --output "$output" "walks/${name}.ts"
done

echo "Done. Binaries are in dist/."
