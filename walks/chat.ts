import { amble, node, Nextable } from "../ambler.ts";
import { ChatPromptNode } from "../nodes/chatPromptNode.ts";
import { ChatResponseNode } from "../nodes/chatResponseNode.ts";
import { ChatByeNode } from "../nodes/chatByeNode.ts";

export interface State {
  messages: Array<{ role: string; content: string }>;
}

const initialState: State = {
  messages: [],
};

const nodes: Record<string, Nextable<State>> = {
  prompt: node(() => ChatPromptNode.create({ onChat: nodes.response, onQuit: nodes.bye })),
  response: node(() => ChatResponseNode.create({ onPrompt: nodes.prompt })),
  bye: node(() => ChatByeNode.create()),
};

if (import.meta.main) {
  await amble(nodes.prompt, initialState);
}
