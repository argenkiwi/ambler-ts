# Program Specifications

This program is an interactive chatbot that connects to a locally running Ollama instance. The user selects a model from the available list, then enters prompts which the model answers one by one until the user types an exit command.

## Shared State

- `model`: The name of the Ollama model selected by the user.

## Steps

### Select Model
- This is the initial step of the application.
- Fetches the list of available models from the Ollama API.
- If no models are available, prints an error message and terminates.
- Displays a numbered list of available models and prompts the user to enter a number.
- Loops until the user enters a valid selection.
- Stores the selected model name in state and proceeds to `CHAT`.

### Chat
- Prompts the user for input with `> `.
- If the user enters `/quit`, `/exit`, or `/bye`, prints `Goodbye!` and terminates.
- If the input is empty, loops back to `CHAT` without sending a request.
- Otherwise, sends the prompt to the Ollama API using the selected model, prints the response, and proceeds to `CHAT`.
