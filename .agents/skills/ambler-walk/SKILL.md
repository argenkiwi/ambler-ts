---
name: ambler-walk
description: Explains how to create a walk in the ambler project. Use this when the user wants to add a new workflow, process, or end-to-end feature that involves multiple steps (nodes) and shared state.
metadata:
  author: argenkiwi
  version: "1.5"
---

# Ambler Walk

Follow these steps to create a new walk in the Ambler project. A "walk" represents a directed graph of nodes where each node performs a specific task (via a core) and transitions to the next node based on the outcome.

## 1. Identify Walk Nodes

Break down the desired process into discrete, logical steps. Each step will be a **Node** in the walk.
- Identify the starting point.
- Identify decision points and error states.
- Identify the termination point (where the walk stops).

## 2. Determine Shared State

The shared state is the single source of truth that travels through the walk.
- List all inputs required by each node's core.
- List all outputs produced by each node's core that need to be persisted for later steps.
- Combine these into a `State` interface. This interface should be defined at the top of your walk file in `walks/`.

## 3. Write the Specification

Create a markdown file in `specs/` named after your walk (e.g., `specs/my-walk.md`).
- Describe the overall purpose of the walk.
- Define the `Shared State` structure.
- Document each **Step** (Node), including:
    - Its responsibility.
    - Possible outcomes and where they lead.
    - Side effects (e.g., printing to console, file I/O).

## 4. Implement Cores and Tests

For each unique behavior in your walk, implement or reuse a **Core**.
- **Cores** are the "brains" of the nodes. They are pure functions (wrapped in factories) that take specific inputs and return a tuple `[nextEdge, output]`.
- Follow the instructions in the `ambler-core` skill to create files in `cores/`.
- **Reusability**: Remember that one core can be used by multiple nodes or even across different walks.
- **Testing**: Every core MUST have a corresponding test in `cores/tests/`. Use the `ambler-test` skill to ensure full coverage of all edges.

## 5. Implement the Walk

Create the walk file in `walks/` (e.g., `walks/my-walk.ts`).

### Step-by-Step Implementation

1. **Define Types**:
   ```typescript
   export interface State {
     // ... define shared fields
   }

   type NodeId = "start" | "step1" | "step2" | "end"; // All node keys
   ```

2. **Initialize Ambler**:
   Use the `ambler<State, NodeId>` function to define the graph. Each key is a node ID, and its value is a factory that returns a `Node` function.

   ```typescript
   const amble = ambler<State, NodeId>({
     start: () => {
       const core = someCoreFactory({
         onSuccess: "step1",
         onError: "end"
       });
       return async (state) => {
         const [edge, output] = await core(state.inputData);
         return [edge, { ...state, result: output }];
       };
     },
     // ... other nodes
   });
   ```

3. **Explicit Type Declarations**:
   Ensure all return types and parameters match the `ambler.ts` definitions. Node functions must return `[NodeId | null, State]` or a Promise of it.

4. **Main Loop (Optional)**:
   If the walk is meant to be executed directly, add an `if (import.meta.main)` block to run the state machine until `nodeId` becomes `null`.

   ```typescript
   if (import.meta.main) {
     let nodeId: NodeId | null = "start";
     let state: State = { /* initial state */ };

     while (nodeId) {
       const next = amble(nodeId, state);
       [nodeId, state] = next instanceof Promise ? await next : next;
     }
   }
   ```

## Key Architectural Principles

- **Node-Core Split**: The **Core** handles the business logic and logical transitions (Edges). The **Node** (inside the walk) handles the mapping between the Core's outputs and the Walk's shared **State**, as well as mapping the Core's **Edges** to actual **NodeIds**.
- **Immutability**: Always return a new state object (using spread syntax `{...state}`) rather than mutating the existing one.
- **Type Safety**: Leverage TypeScript's type system to ensure that node transitions are valid and state transitions are consistent.
