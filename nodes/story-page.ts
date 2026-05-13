import { NodeFactory } from "../ambler.ts";
import { ollamaChat } from "../utils/ollama_chat.ts";

export interface State {
  host: string;
  model: string;
  identity: string;
  placement: string;
  circumstances: string;
  story_pages: string[];
  current_page: number;
}

export type Edge = "onStoryEnd" | "onStoryContinue";

export type Utils = {
  chat: (
    messages: { role: string; content: string }[],
    model: string,
    host: string,
  ) => Promise<string>;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  chat: ollamaChat,
  print: (msg) => console.log(msg),
};

function buildPrompt(
  identity: string,
  placement: string,
  circumstances: string,
  pages: string[],
  pageNumber: number,
): string {
  const priorPages = pages.length > 0
    ? `\n\n=== Previous Pages ===\n${pages.join("\n\n")}\n\n=== End Previous Pages ===`
    : "";

  return `You are writing a Choose Your Own Adventure story, one page at a time.

The protagonist: ${identity}
The setting: ${placement}
The opening situation: ${circumstances}

This is page ${pageNumber}.

${priorPages}

Write the next page of the story. Keep it engaging and between 3-6 paragraphs.

At the end of the page, do ONE of the following:
- If the story feels complete, write "The End" on its own line.
- Otherwise, provide a numbered list of 2-3 options for the reader to choose from, formatted as checkboxes like:
  - [ ] 1. Option one description
  - [ ] 2. Option two description
  - [ ] 3. Option three description

${pageNumber > 4 ? "The story has been going a while - consider wrapping it up." : ""}

Write only the story page content. Do not include meta-commentary.`;
}

export const factory: NodeFactory<State, Edge, Utils> = (
  edges,
  utils = defaultUtils,
) => {
  return async (state) => {
    const messages = [
      {
        role: "user",
        content: buildPrompt(
          state.identity,
          state.placement,
          state.circumstances,
          state.story_pages,
          state.current_page,
        ),
      },
    ];

    const page = await utils.chat(messages, state.model, state.host);

    utils.print(`\n--- Page ${state.current_page} ---\n`);
    utils.print(page);
    utils.print("\n");

    const nextPageNum = state.current_page + 1;

    // Check if the page contains "The End"
    if (page.includes("The End")) {
      return [
        edges.onStoryEnd,
        {
          ...state,
          story_pages: [...state.story_pages, page],
          current_page: nextPageNum,
        },
      ];
    }

    return [
      edges.onStoryContinue,
      {
        ...state,
        story_pages: [...state.story_pages, page],
        current_page: nextPageNum,
      },
    ];
  };
};
