export type Edge = "onSuccess" | "onError";

export type Utils = {
  readLine: (msg: string) => string | null;
  print: (msg: string) => void;
};

const defaultUtils: Utils = {
  readLine: (msg) => prompt(msg),
  print: (msg) => console.log(msg),
};

export const factory = <N extends string>(
  edges: Record<Edge, N>,
  utils = defaultUtils,
) =>
(): [N, number] => {
  const userInput = utils.readLine("Enter a starting number: ");

  if (userInput === null || userInput === "") {
    return [edges.onSuccess, 0];
  }

  const n = parseInt(userInput);
  if (isNaN(n)) {
    utils.print("Error: Invalid input. Please enter a number.");
    return [edges.onError, 0];
  }

  return [edges.onSuccess, n];
};
