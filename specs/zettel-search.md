# Program Specifications

This program ranks zettels relevant to a query, blending keyword search with optional semantic similarity so it degrades gracefully when no embeddings host is reachable.

## Nodes

### Search
- Role — Sole node of the program.
- Logic — Runs a full-text keyword search for `query` and assigns each match a rank-based score. If a local embeddings host is reachable, also embeds the query and computes cosine similarity against every stored embedding: matches already found by keyword search get their score boosted, and any additional zettel found only through semantic similarity is added to the results — so conceptually related notes that share no words with the query can still surface. Results are sorted by combined score and capped at `limit`.
- Termination — If any results are found, prints the ranked array as JSON and exits. If nothing matches, prints `[]` and exits.

## Shared State

- `query`: The search text.
- `limit`: Optional maximum number of results (defaults to 5).
- `results`: The ranked list of matches, once known.
- `error`: Unused today — reserved for future failure reporting.
