# Program Specifications

This program simulates an ASCII-based slot machine game where players bet points to win larger amounts based on symbol matches.

## Nodes

### Start
- Initial node of the application.
- Displays current points and prompts the player to enter a bet amount.
- If the bet is 0, it transitions to `GAME_OVER`.
- If the bet is valid (positive and not exceeding current points), it transitions to `SPIN`.
- If the bet is invalid, it displays an error message and stays at `START`.

### Spin
- Simulates the slot machine animation.
- Displays three symbols one by one with a short delay to create a spinning effect.
- Transitions to `RESULT`.

### Result
- Calculates and updates points.
- Determines whether the player won (Jackpot, Two identical, or Nothing), displays the outcome, and adds/subtracts the corresponding points from the total.
- If current points are greater than 0, it transitions back to `START`.
- If current points have reached 0 or less, it transitions to `GAME_OVER`.

### GameOver
- Termination node.
- Displays the final number of points and terminates the game.

## Shared State

The shared state consists of:
- `nbPoints`: An integer representing the player's current total of points (starting value is 200).
