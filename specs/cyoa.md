# Program Specifications

This program is a Choose Your Own Adventure (CYOA) story generator. It discovers a local Ollama server, lets the user pick a model, collects story context, and then iteratively generates pages — pausing after each to let the user pick the next action — until the story ends and is saved to disk.

## Nodes

### Ollama Check
- Role — Startup node.
- Logic — Verifies if Ollama is reachable at the configured host (defaults to `http://localhost:11434`). If not, prompts the user to enter a host URL.
- Edges — On success, transitions to `MODEL_SELECT`. On error (e.g. host still unreachable), loops back to `OLLAMA_CHECK` to retry or update host.

### Model Select
- Role — Configuration node.
- Logic — Lists available models from the Ollama host and prompts the user to select one.
- Edges — Transitions to `STORY_INTRO` to collect story context.

### Story Intro
- Role — Context collection node.
- Logic — Prompts the user for the protagonist (`identity`), setting (`placement`), and opening situation (`circumstances`), in sequence.
- Edges — If the user cancels any prompt, terminates. Once all three are provided, transitions to `STORY_PAGE`.

### Story Page
- Role — Page generation node.
- Logic — Generates the next page of the story by sending the accumulated context and prior pages to the AI model. The model is instructed to end with "The End" (story complete) or a numbered checkbox list of 2–3 actions (story continues). Appends the new page to `story_pages` and increments `current_page`.
- Edges — If the page ends with "The End", transitions to `STORY_SAVE`. Otherwise, transitions to `STORY_DECISION`.

### Story Decision
- Role — User choice node.
- Logic — Reads the options from the end of the last story page. Prompts the user to select an option by number; re-prompts on invalid input. Marks the chosen checkbox (`[ ]` → `[x]`) in the last page.
- Edges — If there are no checkbox options, transitions directly to `STORY_PAGE`. If the user cancels, terminates. On valid selection, transitions to `STORY_PAGE`.

### Story Save
- Role — Termination node.
- Logic — Joins all story pages into a single Markdown document and saves it to a timestamped file in the `cyoa/` directory.
- Termination — Terminates after saving (or after printing an error if save fails).

## Shared State

- `host`: The Ollama host URL (discovered or manually entered).
- `model`: The name of the model chosen by the user.
- `identity`: Description of the story's protagonist.
- `placement`: The time and place where the story is set.
- `circumstances`: The situation the protagonist finds themselves in at the start.
- `story_pages`: Ordered list of generated story page texts.
- `current_page`: Current page number; used to increase the probability of the story ending as it grows.
