import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import {
  addTaskInputSchema,
  listTasksInputSchema,
  completeTaskInputSchema,
} from "./schemas/index.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "my-first-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "greet",
    {
      description: "Say hello",
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "Hello from MCP server!",
          },
        ],
      };
    },
  );


  server.registerTool(
    "add_task",
    {
      description: "Create a new task",
      inputSchema: addTaskInputSchema,
    },
    async ({ title }) => {
      return {
        content: [
          {
            type: "text",
            text: `Task created: ${title}`,
          },
        ],
      };
    },
  );


  server.registerTool(
    "list_tasks",
    {
      description: "List tasks with optional status filter",
      inputSchema: listTasksInputSchema,
    },
    async ({ status }) => {
      return {
        content: [
          {
            type: "text",
            text: `Listing tasks with status: ${status ?? "all"}`,
          },
        ],
      };
    },
  );


  server.registerTool(
    "complete_task",
    {
      description: "Mark a task as completed",
      inputSchema: completeTaskInputSchema,
    },
    async ({ id }) => {
      return {
        content: [
          {
            type: "text",
            text: `Task ${id} completed`,
          },
        ],
      };
    },
  );


  return server;
}

void serveStdio(createServer);
console.error("my-first-mcp MCP server running on stdio");