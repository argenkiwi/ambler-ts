# Program Specifications

This program is a variation of the `chat` walk. It captures user input and "trolls" the LLM by transposing the letters of the user's prompt before sending it for processing. Both walks share the nodes `OllamaCheck`, `ModelSelect`, `Prompt`, `Response`, and `ChatBye`; the only troll-specific node is `Transpose`.

## Nodes

### OllamaCheck
- Role — Startup node, shared with the `chat` walk (sourced from `nodes/ollama-check.ts`).
- Logic — Verifies if Ollama is reachable at the configured host (defaults to `http://localhost:11434`). If not, prompts the user to enter a host URL.
- Edges — On success, transitions to `MODEL_SELECT`. On error (e.g. host still unreachable), loops back to `OLLAMA_CHECK` to retry or update host.

### ModelSelect
- Role — Configuration node, shared with the `chat` walk (sourced from `nodes/model-select.ts`).
- Logic — Lists available models from the Ollama host and prompts the user to select one.
- Edges — Transitions to `PROMPT` to begin the trolling conversation.

### Prompt
- Role — Conversation entry point, shared with the `chat` walk (sourced from `nodes/prompt.ts`).
- Logic — Prompts the user to type a message.
- Edges — If the input is `null` or matches one of the quit words ("bye", "exit", "quit", case-insensitive), it transitions to `CHAT_BYE`. Otherwise, it appends the user message to the history and transitions to `TRANSPOSE`.

### Transpose
- Role — Troll-specific node (sourced from `nodes/transpose.ts`).
- Logic — Applies a letter transposition cipher to the content of the last user message in the shared state, swapping each consonant with the next consonant in its group (e.g. B↔C, D↔F, G↔H, and so on).
- Edges — Always transitions to `RESPONSE`.

### Response
- Role — Handles the LLM reply, shared with the `chat` walk (sourced from `nodes/response.ts`).
- Logic — Sends the full conversation history (with the trolled user message) to the selected Ollama model and awaits a reply, then prints the assistant's reply prefixed with "Assistant: " and appends it to the history.
- Edges — Transitions to `PROMPT` to continue the conversation.

### ChatBye
- Role — Termination node, shared with the `chat` walk (sourced from `nodes/chat-bye.ts`).
- Logic — Prints a goodbye message.
- Termination — Exits the process.

## Shared State

- `messages`: A list of messages exchanged so far, each with a `role` ("user" or "assistant") and `content` (the message text, trolled on the user side before sending).
- `host`: The Ollama host URL.
- `model`: The name of the selected model.
