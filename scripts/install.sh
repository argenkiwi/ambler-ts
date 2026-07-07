#!/bin/sh
# Compiles the `ambler` walk for the current machine and installs it onto
# the user's PATH, so it can be run as a standalone `ambler` command.
set -eu

cd "$(dirname "$0")/.."

os="$(uname -s)"
arch="$(uname -m)"

case "$os" in
  Darwin)
    case "$arch" in
      arm64) target="aarch64-apple-darwin" ;;
      *) target="x86_64-apple-darwin" ;;
    esac
    ;;
  Linux)
    case "$arch" in
      aarch64|arm64) target="aarch64-unknown-linux-gnu" ;;
      *) target="x86_64-unknown-linux-gnu" ;;
    esac
    ;;
  *)
    echo "Unsupported OS for automatic install: ${os}" >&2
    echo "Run 'deno task build' and copy the matching dist/ambler-<target> binary onto your PATH manually." >&2
    exit 1
    ;;
esac

mkdir -p dist
binary="dist/ambler-${target}"
echo "Compiling ambler for ${target}..."
deno compile --allow-read --allow-write --target "$target" --output "$binary" walks/ambler.ts

install_dir="$HOME/.local/bin"
if [ ! -d "$install_dir" ] || [ ! -w "$install_dir" ]; then
  install_dir="/usr/local/bin"
fi

mkdir -p "$install_dir" 2>/dev/null || true
cp "$binary" "$install_dir/ambler"
chmod +x "$install_dir/ambler"

echo "Installed ambler to ${install_dir}/ambler"

case ":$PATH:" in
  *":$install_dir:"*) ;;
  *) echo "Note: ${install_dir} is not on your PATH. Add it, e.g.:" >&2
     echo "  export PATH=\"${install_dir}:\$PATH\"" >&2 ;;
esac
