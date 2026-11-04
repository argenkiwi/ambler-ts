{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  # Host shell: Deno toolchain + scripts that drive the sandboxed Pi agent.
  # Pi itself never runs on the host — it auto-executes commands without
  # prompting, so it only runs inside the `ambler-pi` Docker container.

  # https://devenv.sh/packages/
  packages = [ pkgs.git ];

  # https://devenv.sh/languages/
  languages.deno.enable = true;

  env.SANDBOX_IMAGE = "ambler-pi";

  # .env holds azk's EMBEDDING_* settings; don't load it into the shell.
  dotenv.disableHint = true;

  # https://devenv.sh/scripts/
  scripts.sandbox-build.exec = ''
    set -euo pipefail
    deno_version="$(deno --version | awk 'NR==1{print $2}')"
    docker build -t "$SANDBOX_IMAGE" \
      --build-arg DENO_VERSION="$deno_version" \
      "$DEVENV_ROOT/sandbox"
  '';

  # Usage: sandbox-run <entrypoint> [args...]
  scripts.sandbox-run.exec = ''
    set -euo pipefail
    if ! docker info >/dev/null 2>&1; then
      echo "Docker isn't running — start Docker Desktop first." >&2
      exit 1
    fi
    if ! docker image inspect "$SANDBOX_IMAGE" >/dev/null 2>&1; then
      sandbox-build
    fi

    entrypoint="$1"; shift
    tty_flags=(-i)
    if [ -t 0 ] && [ -t 1 ]; then tty_flags+=(-t); fi

    git_name="$(git config user.name || true)"
    git_email="$(git config user.email || true)"

    exec docker run --rm "''${tty_flags[@]}" \
      -v "$DEVENV_ROOT":/workspace -w /workspace \
      -v ambler-pi-sessions:/root/.pi/agent/sessions \
      -v ambler-deno-cache:/deno-dir -e DENO_DIR=/deno-dir \
      --add-host=host.docker.internal:host-gateway \
      -e EMBEDDING_HOST=http://host.docker.internal:11434/v1 \
      -e GIT_AUTHOR_NAME="$git_name" -e GIT_AUTHOR_EMAIL="$git_email" \
      -e GIT_COMMITTER_NAME="$git_name" -e GIT_COMMITTER_EMAIL="$git_email" \
      -e PI_TELEMETRY=0 -e PI_SKIP_VERSION_CHECK=1 \
      --entrypoint "$entrypoint" \
      "$SANDBOX_IMAGE" "$@"
  '';

  # Sandboxed Pi agent (shadows any host `pi` inside this shell).
  scripts.pi.exec = ''exec sandbox-run pi "$@"'';

  # Debug shell inside the same container setup.
  scripts.sandbox-shell.exec = ''exec sandbox-run bash "$@"'';

  # https://devenv.sh/basics/
  enterShell = ''
    echo "ambler-ts: $(deno --version | head -1)"
    echo "  pi            → Pi coding agent in the '$SANDBOX_IMAGE' container (Ollama qwen3.8:27b-mlx on host)"
    echo "  sandbox-shell → bash in the same container; sandbox-build → rebuild the image"
    if ! docker info >/dev/null 2>&1; then
      echo "  ⚠ Docker isn't running — start Docker Desktop before using pi."
    fi
  '';

  # https://devenv.sh/tests/
  enterTest = ''
    deno test nodes/tests/
  '';

  # See full reference at https://devenv.sh/reference/options/
}
