/**
 * RAG MCP Server — Product AI UX Knowledge Base
 * Exposes a query_knowledge_base tool that Claude can call
 * during sessions to retrieve UX/product design context.
 *
 * Usage: node rag-mcp-server.js
 * Register: claude mcp add ux-rag-server -- node /path/to/mcp-server/rag-mcp-server.js
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_PATH = join(__dirname, "knowledge-base");

// ── helpers ────────────────────────────────────────────────────────────────

function loadDocuments() {
  if (!existsSync(KB_PATH)) return [];
  return readdirSync(KB_PATH)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
    .map((f) => ({
      name: f,
      content: readFileSync(join(KB_PATH, f), "utf-8"),
    }));
}

function rankByRelevance(query, docs) {
  const terms = query.toLowerCase().split(/\s+/);
  return docs
    .map((doc) => {
      const text = doc.content.toLowerCase();
      const score = terms.reduce(
        (acc, t) => acc + (text.split(t).length - 1),
        0
      );
      return { ...doc, score };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ── server setup ───────────────────────────────────────────────────────────

const server = new Server(
  { name: "ux-rag-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "query_knowledge_base",
      description:
        "Query the UX / product design knowledge base. Returns the most relevant document excerpts matching your query.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Natural-language question or search terms",
          },
          max_results: {
            type: "number",
            description: "Maximum number of document excerpts to return (default: 3)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "list_documents",
      description: "List all documents available in the knowledge base.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_documents") {
    const docs = loadDocuments();
    if (docs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Knowledge base is empty. Add .md or .txt files to mcp-server/knowledge-base/",
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: docs.map((d) => `• ${d.name}`).join("\n"),
        },
      ],
    };
  }

  if (name === "query_knowledge_base") {
    const query = String(args?.query ?? "");
    const maxResults = Number(args?.max_results ?? 3);

    if (!query) {
      return {
        content: [{ type: "text", text: "Error: query is required." }],
        isError: true,
      };
    }

    const docs = loadDocuments();
    if (docs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Knowledge base is empty. Add .md or .txt files to mcp-server/knowledge-base/",
          },
        ],
      };
    }

    const ranked = rankByRelevance(query, docs).slice(0, maxResults);
    if (ranked.length === 0) {
      return {
        content: [
          { type: "text", text: `No documents matched the query: "${query}"` },
        ],
      };
    }

    const output = ranked
      .map(
        (d, i) =>
          `### Result ${i + 1}: ${d.name} (score: ${d.score})\n\n${d.content.slice(0, 1500)}${d.content.length > 1500 ? "\n…[truncated]" : ""}`
      )
      .join("\n\n---\n\n");

    return { content: [{ type: "text", text: output }] };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ── start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
