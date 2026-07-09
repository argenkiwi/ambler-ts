import { ambler, Node } from "../ambler.ts";
import defer * as routerNode from "../nodes/azk-router.ts";
import defer * as searchNode from "../nodes/azk-search.ts";
import defer * as createNode from "../nodes/azk-create.ts";
import defer * as getNode from "../nodes/azk-get.ts";
import defer * as updateNode from "../nodes/azk-update.ts";
import defer * as deleteNode from "../nodes/azk-delete.ts";
import defer * as linkNode from "../nodes/azk-link.ts";
import defer * as reindexNode from "../nodes/azk-reindex.ts";
import { readStdinJson } from "../utils/stdin.ts";

export interface State {
  action?: string;
  id?: string;
  query?: string;
  limit?: number;
  results?: any[];
  title?: string;
  body?: string;
  tags?: string[];
  links?: any[];
  fromId?: string;
  toId?: string;
  relation?: string;
  result?: any;
  error?: string;
}

type NodeId =
  | "ROUTE"
  | "SEARCH"
  | "CREATE"
  | "GET"
  | "UPDATE"
  | "DELETE"
  | "LINK"
  | "REINDEX";

const amble = ambler<State, NodeId>({
  ROUTE: () =>
    routerNode.factory({
      onSearch: "SEARCH",
      onCreate: "CREATE",
      onGet: "GET",
      onUpdate: "UPDATE",
      onDelete: "DELETE",
      onLink: "LINK",
      onReindex: "REINDEX",
      onError: null,
    }) as unknown as Node<State, NodeId>,
  SEARCH: () =>
    searchNode.factory({ onFound: null, onEmpty: null }) as unknown as Node<State, NodeId>,
  CREATE: () =>
    createNode.factory({ onCreated: null, onError: null }) as unknown as Node<State, NodeId>,
  GET: () =>
    getNode.factory({ onFound: null, onNotFound: null }) as unknown as Node<State, NodeId>,
  UPDATE: () =>
    updateNode.factory({ onUpdated: null, onNotFound: null }) as unknown as Node<State, NodeId>,
  DELETE: () =>
    deleteNode.factory({ onDeleted: null, onNotFound: null }) as unknown as Node<State, NodeId>,
  LINK: () =>
    linkNode.factory({ onLinked: null, onError: null }) as unknown as Node<State, NodeId>,
  REINDEX: () =>
    reindexNode.factory({ onIndexed: null }) as unknown as Node<State, NodeId>,
});

if (import.meta.main) {
  const action = Deno.args[0];

  if (!action) {
    console.error(
      "Usage: deno task azk <action> [args]\n\n" +
        "Actions:\n" +
        "  search <query> [limit]\n" +
        "  create (reads JSON from stdin)\n" +
        "  get <id>\n" +
        "  update <id> (reads JSON from stdin)\n" +
        "  delete <id>\n" +
        "  link <fromId> <toId> <relation>\n" +
        "  reindex",
    );
    Deno.exit(1);
  }

  let state: State = { action };

  switch (action.toLowerCase()) {
    case "search": {
      const query = Deno.args[1];
      const limit = Deno.args[2] ? Number(Deno.args[2]) : undefined;
      if (!query) {
        console.error('Usage: deno task azk search "<query>" [limit]');
        Deno.exit(1);
      }
      state = { ...state, query, limit };
      break;
    }
    case "create": {
      const input = await readStdinJson<{
        title: string;
        body: string;
        tags?: string[];
        links?: { toId: string; relation: string }[];
      }>();
      if (!input.title || !input.body) {
        console.error(JSON.stringify({ error: "title and body are required" }));
        Deno.exit(1);
      }
      state = {
        ...state,
        title: input.title,
        body: input.body,
        tags: input.tags ?? [],
        links: input.links,
      };
      break;
    }
    case "get": {
      const id = Deno.args[1];
      if (!id) {
        console.error("Usage: deno task azk get <id>");
        Deno.exit(1);
      }
      state = { ...state, id };
      break;
    }
    case "update": {
      const id = Deno.args[1];
      if (!id) {
        console.error(
          "Usage: echo '{\"title\":\"...\"}' | deno task azk update <id>",
        );
        Deno.exit(1);
      }
      const input = await readStdinJson<{
        title?: string;
        body?: string;
        tags?: string[];
      }>();
      state = { ...state, id, ...input };
      break;
    }
    case "delete": {
      const id = Deno.args[1];
      if (!id) {
        console.error("Usage: deno task azk delete <id>");
        Deno.exit(1);
      }
      state = { ...state, id };
      break;
    }
    case "link": {
      const [_, fromId, toId, relation] = Deno.args;
      if (!fromId || !toId || !relation) {
        console.error(
          'Usage: deno task azk link <fromId> <toId> "<relation>"',
        );
        Deno.exit(1);
      }
      state = { ...state, fromId, toId, relation };
      break;
    }
    case "reindex":
      break;
    default:
      console.error(`Unknown action: ${action}`);
      Deno.exit(1);
  }

  let nodeId: NodeId | null = "ROUTE";

  while (nodeId) {
    const next = amble(nodeId, state);
    [nodeId, state] = next instanceof Promise ? await next : next;
  }
}
