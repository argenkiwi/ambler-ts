export type Edge = "onPromptComplete" | "onCancel";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory = <N extends string>(
  edges: Record<Edge, N | null>,
  utils = defaultUtils,
) =>
(): [N | null, string] => {
  utils.print("\n--- Solar Prompt Input ---");
  const promptText = utils.readLine("Enter your solar prompt: ");
  if (promptText === null) return [edges.onCancel, ""];

  return [edges.onPromptComplete, promptText];
};
