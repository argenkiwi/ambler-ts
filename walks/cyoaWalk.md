# Program Specifications

A Choose Your Own Adventure (CYOA) story generator that uses Ollama to iteratively write a story.

## Shared State

- `selectedModel`: The name of the Ollama model chosen by the user.
- `identity`: The identity of the protagonist.
- `placement`: The setting (where/when) of the story.
- `circumstances`: The initial situation of the story.
- `storyPages`: An array of strings, each representing a page of the story.

## Steps

### ModelSelect
- Prompts the user to select an available Ollama model from a list.
- Transitions to `Intro` on selection.

### Intro
- Prompts the user for the protagonist's identity, placement, and circumstances.
- Transitions to `Page` once all details are provided.

### Page
- Uses the selected model to generate a new page of the story.
- The page continues from the previous contents.
- It must end with "The End" if the story ends, or two markdown checkboxes for user choices if it continues.
- If "The End" is reached, transitions to `Save`.
- If choices are provided, transitions back to `Page` after the user makes a choice (the implementation currently repeats the page generation loop).

### Save
- Saves the entire story to the `cyoa/` folder as a markdown file with a timestamped filename.
- Transitions to `Stop`.

### Stop
- Terminates the walk.
