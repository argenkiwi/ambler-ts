# Use a Node.js base image for Pi Agent
FROM node:slim

# Install Ollama (using the official script)
RUN apt-get update && \
    apt-get install -y curl zstd && \
    curl -fsSL https://ollama.com/install.sh | sh

# Install Deno and the Pi Coding Agent.
RUN npm i -g deno @mariozechner/pi-coding-agent

# Set working directory
WORKDIR /app

# Start Ollama and Pi Agent
CMD ["sh", "-c", "ollama launch pi"]
