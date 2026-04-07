# Program Specifications

This program is a simple chatbot application that interacts with an LLM running on Ollama. It demonstrates a conversational loop using the Ambler framework.

## Shared State

The shared state is an array of messages representing the chat history. Each message has a `role` (user or assistant) and `content`.

## Steps

### Prompt
- This is the initial step of the conversation.
- Prompts the user to enter a message.
- If the input is "bye", "quit", or "exit", it proceeds to `EXIT`.
- Otherwise, it appends the user's message to the chat history and proceeds to `OLLAMA`.

### Ollama
- Sends the entire chat history to the Ollama API (e.g., model `llama3`).
- Displays the LLM's response to the user.
- Appends the LLM's response to the chat history.
- Proceeds back to `PROMPT` for the next user input.

### Exit (Final Step)
- Displays a goodbye message and terminates the conversation.
