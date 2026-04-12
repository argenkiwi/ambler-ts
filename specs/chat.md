
# Program Specifications

This program implements a conversational chat interface between the user and an LLM running locally via Ollama. The conversation continues until the user types "bye", "exit", or "quit".

## Shared State

The shared state is a list of messages exchanged so far, each with a `role` ("user" or "assistant") and `content` (the message text).

## Steps

### Chat Prompt
- This is the initial step of the application.
- Prompts the user to type a message.
- If the input is `null` or matches one of the quit words ("bye", "exit", "quit", case-insensitive), it proceeds to `CHAT_BYE`.
- Otherwise, it appends the user message to the history and proceeds to `CHAT_RESPONSE`.

### Chat Response
- Sends the full conversation history to Ollama and awaits a reply.
- Prints the assistant's reply prefixed with "Assistant: ".
- Appends the assistant's reply to the history.
- Proceeds to `CHAT_PROMPT` to continue the conversation.

### Chat Bye
- Prints a goodbye message.
- Terminates the process.
