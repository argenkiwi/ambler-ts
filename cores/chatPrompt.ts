export type Message = { role: string; content: string };

export type Edge = "onChat" | "onQuit";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

const QUIT_WORDS = new Set(["bye", "exit", "quit"]);

export const factory = <N extends string | null>(
  edges: Record<Edge, N>,
  utils = defaultUtils,
) =>
(messages: Message[]): [N, Message[]] => {
  const userInput = utils.readLine("You: ");
  if (userInput === null) {
    return [edges.onQuit, messages];
  }

  const trimmed = userInput.trim();
  if (QUIT_WORDS.has(trimmed.toLowerCase())) {
    return [edges.onQuit, messages];
  }

  const updatedMessages: Message[] = [
    ...messages,
    { role: "user", content: trimmed },
  ];

  return [edges.onChat, updatedMessages];
};
