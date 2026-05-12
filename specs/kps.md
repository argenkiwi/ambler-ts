# Program Specifications

A combat-based variation of Rock-Paper-Scissors with health and six move options.

## Moves

The game features two types of moves:

### Offensive Moves
- **Kick (k)**: Beats Punch.
- **Punch (p)**: Beats Sweep.
- **Sweep (s)**: Beats Kick.

### Defensive Moves
Defensive moves counter one specific offensive move, are weak to another, and draw with the third.
- **Crouch (c)**: Counters Kick. Weak to Punch. Draws with Sweep.
- **Block (b)**: Counters Punch. Weak to Sweep. Draws with Kick.
- **Jump (j)**: Counters Sweep. Weak to Kick. Draws with Punch.

## Outcomes & Damage

Health starts at **10** and is capped at **10**.

| Outcome | Description | Health Change (Self, Opponent) |
| :--- | :--- | :--- |
| **Win** | Your offensive move beats their offensive move. | (0, -2) |
| **Lose** | Their offensive move beats your offensive move. | (-2, 0) |
| **Trade** | Both players use the same offensive move. | (-1, -1) |
| **Chip** | Your offensive move hits their non-countering defensive move. | (0, -1) |
| **Ouch** | Their offensive move hits your non-countering defensive move. | (-1, 0) |
| **Dodge** | Your defensive move successfully counters their offensive move. | (+1, 0) |
| **Miss** | Their defensive move successfully counters your offensive move. | (0, +1) |
| **Draw** | Any other combination (e.g., two defensive moves). | (0, 0) |

## Nodes

### Start
- Initial node of the application.
- Prints "Welcome to Kick-Punch-Sweep!" and sets health to 10 for both player and CPU.
- Transitions to `PLAYERCHOICE`.

### Player Choice
- Input node — collects the player's move for the round.
- Prints current health and prompts the player to choose a move (k, p, s, c, b, j).
- If the input is valid, transitions to `COMPUTERCHOICE`.
- If the input is invalid, transitions to `PLAYERCHOICE`.

### Computer Choice
- Action node — selects the CPU's move for the round.
- Randomly selects a move for the CPU.
- Transitions to `COMPARE`.

### Compare
- Action node — evaluates the turn and updates health.
- Compares the player's and CPU's moves based on the Outcome table.
- Updates health (min 0, max 10) and prints both moves and the turn outcome.
- Transitions to `RESULT`.

### Result
- Decision node — determines whether the game continues or ends.
- Checks if the game has ended (either player drops to 0 health or below).
- If both players still have health remaining, transitions to `PLAYERCHOICE`.
- If the game has ended, prints the winner (or draw) and transitions to `PLAYAGAIN`.

### Play Again
- Input node — asks whether to replay.
- Asks the player if they want to play another round.
- If the player answers yes, resets health and transitions to `START`.
- If the player answers no, transitions to `STOP`.

### Stop
- Termination node.
- Prints "Thanks for playing!" and terminates.

## Shared State

The shared state consists of:
- `playerHealth`: A number representing the player's current health (starts at 10).
- `cpuHealth`: A number representing the CPU's current health (starts at 10).
- `playerMove`: The move selected by the player (kick, punch, sweep, crouch, block, jump).
- `cpuMove`: The move selected by the CPU (kick, punch, sweep, crouch, block, jump).
- `outcome`: The result of the turn comparison (Win, Lose, Trade, Chip, Ouch, Dodge, Miss, Draw).
