# Program Specifications

This program implements a conversational chat interface between the user and a locally running LLM accessible via an OpenAI-compatible API. The conversation continues until the user types "bye", "exit", or "quit".

## Nodes

### LLM Check
- Role — Startup node.
- Logic — Verifies if a local LLM is reachable by trying the default hosts (`http://localhost:11434/v1` and `http://localhost:1234/v1` in order). If none are reachable, prompts the user to enter a host URL.
- Edges — On success, transitions to `MODEL_SELECT`. On error (e.g. host still unreachable), loops back to `LLM_CHECK` to retry or update host.

### Model Select
- Role — Configuration node.
- Logic — Lists available models from the LLM host and prompts the user to select one. If no models are found, allows the user to enter a model name manually.
- Edges — Transitions to `CHAT_PROMPT` to start the conversation.

### Chat Prompt
- Role — Conversation entry point.
- Logic — Prompts the user to type a message.
- Edges — If the input is `null` or matches one of the quit words ("bye", "exit", "quit", case-insensitive), it transitions to `CHAT_BYE`. Otherwise, it appends the user message to the history and transitions to `CHAT_RESPONSE`.

### Chat Response
- Role — Handles the LLM reply.
- Logic — Sends the full conversation history to the selected model and awaits a reply, then prints the assistant's reply prefixed with "Assistant: " and appends it to the history.
- Edges — Transitions to `CHAT_PROMPT` to continue the conversation.

### Chat Bye
- Role — Termination node.
- Logic — Prints a goodbye message.
- Termination — Exits the process.

## Shared State

- `messages`: A list of messages exchanged so far, each with a `role` ("user" or "assistant") and `content` (the message text).
- `host`: The LLM host URL (OpenAI-compatible `/v1` endpoint).
- `model`: The name of the selected model.
