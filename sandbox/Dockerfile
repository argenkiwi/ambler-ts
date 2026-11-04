# Sandbox image for the Pi coding agent. Built by `sandbox-build` (devenv.nix),
# which passes DENO_VERSION from the host devenv so both Denos match.
ARG DENO_VERSION=2.9.8
FROM denoland/deno:bin-${DENO_VERSION} AS deno

FROM node:24-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     bash ca-certificates curl fd-find git ripgrep unzip \
  && ln -s /usr/bin/fdfind /usr/local/bin/fd \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deno /deno /usr/local/bin/deno

ARG PI_VERSION=1.5.0
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent@${PI_VERSION}

# The bind-mounted repo is owned by the host user, not root.
RUN git config --system --add safe.directory /workspace

COPY models.json settings.json /root/.pi/agent/

WORKDIR /workspace
ENTRYPOINT ["pi"]
