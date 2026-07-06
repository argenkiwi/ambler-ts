# Program Specifications

This program creates an explicit, phrase-carrying connection between two existing zettels — the deliberate linking step of the Zettelkasten method, run independently of note creation once the caller has decided two notes are related.

## Nodes

### Link
- Role — Sole node of the program.
- Logic — Verifies that both `fromId` and `toId` refer to existing zettels, then records a link between them carrying the given `relation` phrase (e.g. "builds on", "contradicts").
- Termination — On success, prints `{ fromId, toId, relation, linked: true }` and exits. If either zettel does not exist, prints `{ error }` and exits.

## Shared State

- `fromId`: The source zettel's id.
- `toId`: The target zettel's id.
- `relation`: A short phrase explaining why the two notes are connected.
- `result`: The link confirmation, once known.
- `error`: An error message, if either zettel was not found.
