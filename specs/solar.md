# Solar Walk Specification

**Goal:** Generate a high-quality Solarpunk short story based on a user-provided prompt.

**Workflow:**
1.  **Discover Ollama:** Find the running Ollama instance.
2.  **Select Model:** Choose an LLM to generate the story.
3.  **Prompt Input:** The user provides a "Solar Prompt".
4.  **Generate Story:** The agent uses the selected model and the prompt, following the `SOLAR.md` guidelines, to generate the story.
5.  **Display Story:** The generated story (including the epilogue) is printed to the console.
6.  **Save Option:** The user is given the option to save the story to a file.
