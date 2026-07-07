#!/bin/sh
# Cross-compiles the `ambler` walk into standalone binaries for every
# platform Deno supports, under dist/.
set -eu

cd "$(dirname "$0")/.."

TARGETS="x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin aarch64-apple-darwin"

mkdir -p dist

for target in $TARGETS; do
  ext=""
  case "$target" in
    *windows*) ext=".exe" ;;
  esac
  output="dist/ambler-${target}${ext}"
  echo "Building ${output}..."
  deno compile --allow-read --allow-write --target "$target" --output "$output" walks/ambler.ts
done

echo "Done. Binaries are in dist/."
