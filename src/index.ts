import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

function createServer(): McpServer {
  const server = new McpServer({ name: "my-first-mcp", version: "0.1.0" });

  server.registerTool(
    "greet",
    {
      description: "Say hello to someone by name",
      inputSchema: z.object({
        name: z.string().describe("The person's name to greet"),
      }),
    },
    async ({ name }) => {
      return {
        content: [{ type: "text", text: `Hello, ${name}!` }],
      };
    },
  );

  return server;
}

void serveStdio(createServer);
console.error("my-first-mcp MCP server running on stdio");
