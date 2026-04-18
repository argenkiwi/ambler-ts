#!/usr/bin/env bash
podman build -t ambler.ts . && \
podman run -v ${pwd}:/app:z -e OLLAMA_HOST=$OLLAMA_HOST --name ambler.ts --replace -it ambler.ts
