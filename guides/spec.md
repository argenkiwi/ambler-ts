# Specs

Every walk has a plain-language spec at `specs/<walk>.md`, named after the walk (`walks/<walk>.ts`). Write it before the code when planning; `bun run ambler walk` writes a starting point if there is none, and keeps one that exists.

## Format

    # Program Specifications

    <What the program is for, in a sentence or two.>

    ## Nodes

    ### <Node Name>
    - <Role: "Initial node of the application.">
    - <What it does.>
    - <One line per edge: "If the number is valid, it transitions to `COUNT`.">

    ### <Last Node>
    - <What it does, and that it terminates.>

    ## Shared State

    The shared state consists of:
    - `<field>`: <what it holds>.

## Rules

- Exactly these three sections, and one `###` per node.
- Node headings are Title Case and match the walk's node ids: `### Check Config` is the node id `"CHECK_CONFIG"`.
- Edges refer to nodes in backticked capitals: `` `CHECK_CONFIG` ``.
- Each edge is an outcome of the node the section describes: one of its `on…` edges. Several conditions may share one outcome if the walk routes them alike.
- Plain language only: no types, no crate or package names.
- Derive the shared state from what the nodes need. Do not design it first.
- When a walk already exists, the spec follows the code; change both together.

`bun run ambler check` verifies the sections and that the node headings match the walk's node ids. Whether the prose is true is yours to check.
