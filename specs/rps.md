# Program Specifications

This program is a Rock-Paper-Scissors game where a user plays against the computer.

## Shared State

The shared state contains the user's choice, the computer's choice, the result of the round, and a flag indicating if the user wants to play again.

## Steps

### Start
- This is the initial step.
- Prompts the user to enter Rock, Paper, or Scissors.
- If the input is valid, proceeds to `COMPUTE_CHOICE`.
- If the input is invalid, displays an error message and proceeds to `START`.

### Compute Choice
- The computer randomly selects Rock, Paper, or Scissors.
- Proceeds to `DETERMINE_RESULT`.

### Determine Result
- Compares the user's choice with the computer's choice.
- Determines if the result is a Win, Loss, or Tie.
- Proceeds to `DISPLAY_RESULT`.

### Display Result
- Displays the user's choice, the computer's choice, and the outcome of the round.
- Proceeds to `PLAY_AGAIN`.

### Play Again
- Prompts the user if they want to play another round.
- If the user chooses to play again, proceeds to `START`.
- If the user chooses to quit, terminates the program.
