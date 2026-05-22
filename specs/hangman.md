# Program Specifications - Hangman

This program is a console-based Hangman game implemented as an Ambler walk. The player tries to guess a hidden English word letter by letter. Each incorrect guess adds a body part to the hangman figure. Six incorrect guesses means the player loses.

## Nodes

### Menu
- Initial node of the application.
- Displays the Hangman title screen and brief description.
- Controls: Enter to continue, Escape to quit.
- Transitions:
  - `onPlay` -> Play
  - `onExit` -> Exit (null)

### Play
- Core gameplay node.
- Picks a random word from the built-in word list on entry using `utils.pickWord()`.
- Computes `incorrectCount` as the number of guessed letters not found in the word.
- Renders:
  - The hangman gallows (7 ASCII frames indexed 0–6 by `incorrectCount`).
  - The current word with spaces between letters, underscores for unguessed letters.
  - The sorted list of all previously guessed letters (shown when non-empty).
  - Input hint: `[a-z] guess a letter  [escape] exit`.
- Controls:
  - `a`–`z`: Guess a letter (case-insensitive); already-guessed letters are ignored.
  - `Escape`: Exit game.
- Win condition: all letters in the word have been guessed.
- Lose condition: `incorrectCount` reaches 6.
- Transitions:
  - `onGameOver` -> GameOver (sets `word`, `guessed`, `won` in state)
  - `onExit` -> Exit (null)

### GameOver
- Displays the Hangman title.
- Shows the final gallows frame matching `incorrectCount` derived from `state.guessed` and `state.word`.
- Shows the revealed word.
- If `state.won` is true: shows "You win!"
- If `state.won` is false: shows "You lose..." and reveals the answer.
- Controls: Enter to play again, Escape to quit.
- Transitions:
  - `onPlayAgain` -> Menu
  - `onExit` -> Exit (null)

## Shared State

The shared state consists of:
- `word`: The secret word for the current round (empty string initially).
- `guessed`: Array of letters guessed so far (empty array initially).
- `won`: Whether the player won the current round (false initially).
