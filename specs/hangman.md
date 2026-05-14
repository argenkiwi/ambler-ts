# Program Specifications

This program is a classic word guessing game — Hangman. A secret word is chosen and the player attempts to reveal it by guessing one letter at a time. Incorrect guesses contribute to a hangman drawing; too many wrong guesses ends the game in loss. The game supports replay.

## Nodes

### Start
- Initial node of the application.
- Selects a random word from a word list and resets all game state (revealed letters, guessed letters, wrong guess count).
- Transitions to `Display`.

### Display
- Renders the current game state: the partially revealed word (underscores for unguessed letters), the hangman diagram based on the number of wrong guesses, and the list of previously guessed letters.
- Transitions to `Input`.

### Input
- Prompts the user to enter a single letter guess.
- If the input is valid (a single alphabetic character not yet guessed), it transitions to `Check`.
- If the input is invalid (empty, non-letter, or already guessed), it displays a warning and transitions to `Input`.

### Check
- Evaluates the guessed letter against the secret word.
- If the letter is in the word, it marks all matching positions as revealed.
- If the letter is not in the word, it increments the wrong guess count.
- If all letters of the word have been revealed, it transitions to `Win`.
- If the wrong guess count has reached the maximum allowed, it transitions to `Lose`.
- Otherwise, it transitions to `Display`.

### Win
- Displays a success message, reveals the full word, and shows the number of wrong guesses made.
- Transitions to `Replay`.

### Lose
- Displays a loss message, reveals the secret word, and shows the final hangman diagram.
- Transitions to `Replay`.

### Replay
- Prompts the user whether they want to play again.
- If the user answers affirmatively (e.g., "y" or "yes"), it transitions to `Start`.
- Otherwise, it transitions to `Terminate`.

### Terminate
- Termination node.
- Displays a farewell message and exits the program.

## Shared State

The shared state consists of:
- `word`: The secret word to be guessed (string, lowercased for comparison).
- `revealed`: A boolean array, one entry per letter in `word`, tracking which positions have been correctly guessed.
- `wrongGuesses`: An integer counting the number of incorrect guesses so far.
- `maxWrong`: An integer representing the maximum allowed wrong guesses (e.g., 6).
- `guessedLetters`: A set or array of letters the player has already guessed.
- `gameOver`: A boolean flag indicating whether the game has ended (win or lose).
