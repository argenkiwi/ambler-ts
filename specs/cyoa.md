# Program Specifications

This program is a Choose Your Own Adventure (CYOA) story generator. It discovers a local Ollama server, lets the user pick a model, collects story context, and then iteratively generates pages — pausing after each to let the user pick the next action — until the story ends and is saved to disk.

## Shared State

- `ollamaHost`: URL of the discovered or manually entered Ollama server.
- `selectedModel`: Name of the Ollama model chosen by the user.
- `identity`: Description of the story's protagonist.
- `placement`: The time and place where the story is set.
- `circumstances`: The situation the protagonist finds themselves in at the start.
- `storyPages`: Ordered list of generated story page texts.
- `currentPage`: Current page number; used to increase the probability of the story ending as it grows.

## Steps

### Ollama Discover
- This is the initial step.
- Probes a list of candidate Ollama host URLs to find a running server automatically.
- If a reachable host is found, proceeds to `MODEL_SELECT` with `ollamaHost` set.
- If no candidate is reachable, prompts the user to enter a host URL manually.
- If the user cancels the manual prompt, terminates.

### Model Select
- Lists the models available on the Ollama server and prompts the user to select one by index.
- If the user cancels, terminates.
- If the input is invalid or out of range, proceeds to `MODEL_SELECT` with `selectedModel` unchanged (retry).
- If the input is valid, proceeds to `INTRO` with `selectedModel` set.

### Story Intro
- Prompts the user for the protagonist (`identity`), setting (`placement`), and opening situation (`circumstances`), in sequence.
- If the user cancels any prompt, terminates.
- Once all three are provided, proceeds to `PAGE`.

### Story Page
- Generates the next page of the story by sending the accumulated context and prior pages to the AI model.
- The model is instructed to end with "The End" (story complete) or a numbered checkbox list of 2–3 actions (story continues).
- Appends the new page to `storyPages` and increments `currentPage`.
- If the page ends with "The End", proceeds to `SAVE`.
- Otherwise, proceeds to `DECISION`.

### Story Decision
- Reads the options from the end of the last story page.
- If there are no checkbox options, proceeds directly to `PAGE`.
- Prompts the user to select an option by number; re-prompts on invalid input.
- If the user cancels, terminates.
- Marks the chosen checkbox (`[ ]` → `[x]`) in the last page, then proceeds to `PAGE`.

### Story Save
- Joins all story pages into a single Markdown document and saves it to a timestamped file in the `cyoa/` directory.
- If saving fails, prints an error but continues.
- Terminates after saving.
