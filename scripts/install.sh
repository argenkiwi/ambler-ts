#!/bin/sh
# Compiles a walk for the current machine and installs it onto the user's
# PATH. Usage: scripts/install.sh [walk-name] (default: ambler)
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
    echo "Run 'deno task build ${name}' and copy the matching dist/${name}-<target> binary onto your PATH manually." >&2
    exit 1
    ;;
esac

mkdir -p dist
binary="dist/${name}-${target}"
echo "Compiling ${name} for ${target}..."
deno compile $perms --target "$target" --output "$binary" "walks/${name}.ts"

install_dir="$HOME/.local/bin"
if [ ! -d "$install_dir" ] || [ ! -w "$install_dir" ]; then
  install_dir="/usr/local/bin"
fi

mkdir -p "$install_dir" 2>/dev/null || true
cp "$binary" "$install_dir/$name"
chmod +x "$install_dir/$name"

echo "Installed ${name} to ${install_dir}/${name}"

case ":$PATH:" in
  *":$install_dir:"*) ;;
  *) echo "Note: ${install_dir} is not on your PATH. Add it, e.g.:" >&2
     echo "  export PATH=\"${install_dir}:\$PATH\"" >&2 ;;
esac
