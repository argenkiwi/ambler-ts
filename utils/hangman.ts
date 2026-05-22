export const TITLE = `
 _   _
| | | |__ _ _ _  __ _ _ __  __ _ _ _
| |_| / _\` | ' \/ _\` | '  \/ _\` | ' \
 \___/\__,_|_||_\__, |_|_|_\__,_|_||_|
                |___/
`;

export const GALLOWS: string[][] = [
  [
    "  +---+",
    "  |   |",
    "      |",
    "      |",
    "      |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    "      |",
    "      |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    "  |   |",
    "      |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    " /|   |",
    "      |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    " /|\\  |",
    "      |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    " /|\\  |",
    " /    |",
    "      |",
    "=========",
  ],
  [
    "  +---+",
    "  |   |",
    "  O   |",
    " /|\\  |",
    " / \\  |",
    "      |",
    "=========",
  ],
];

export function renderWord(word: string, guessed: string[]): string {
  return word
    .split("")
    .map((l) => (guessed.includes(l) ? l : "_"))
    .join(" ");
}

const WORDS = [
  "apple", "banana", "cherry", "dragon", "elephant", "forest", "garden",
  "harbor", "island", "jungle", "kitten", "lemon", "monkey", "needle",
  "orange", "penguin", "rabbit", "sunset", "turtle", "umbrella", "violet",
  "walrus", "yellow", "zebra", "anchor", "bridge", "candle", "desert",
  "engine", "falcon", "giraffe", "hammer", "insect", "jacket", "kettle",
  "lantern", "marble", "napkin", "oyster", "pillow", "quartz", "rocket",
  "silver", "temple", "unique", "valley", "window", "xylem", "yogurt",
];

export function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export async function readKey(): Promise<string | null> {
  const buf = new Uint8Array(8);
  Deno.stdin.setRaw(true);
  try {
    const n = await Deno.stdin.read(buf);
    if (n === null) return null;
    const byte = buf[0];
    if (byte === 27) return "\x1b";
    if (byte === 13 || byte === 10) return "\r";
    return String.fromCharCode(byte);
  } finally {
    Deno.stdin.setRaw(false);
  }
}
