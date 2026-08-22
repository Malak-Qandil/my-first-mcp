import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { registerAddTaskTool } from "./tools/add-task.js";
import { registerListTasksTool } from "./tools/list-tasks.js";
import { registerCompleteTaskTool } from "./tools/complete-task.js";
import { registerDeleteTaskTool } from "./tools/delete-task.js";
import { registerUpdateTaskTool } from "./tools/update-task.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "my-first-mcp",
    version: "0.2.0",
  });

  registerAddTaskTool(server);
  registerListTasksTool(server);
  registerCompleteTaskTool(server);
  registerDeleteTaskTool(server);
  registerUpdateTaskTool(server);

  return server;
}

void serveStdio(createServer);

console.error("my-first-mcp MCP server running on stdio");