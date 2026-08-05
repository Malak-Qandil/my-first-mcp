import { McpServer } from "@modelcontextprotocol/server";
import { listTasksInputSchema } from "../schemas/index.js";

export function registerListTasksTool(server: McpServer) {
  server.registerTool(
    "list_tasks",
    {
      description: "List tasks with optional status filter",
      inputSchema: listTasksInputSchema,
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                ok: true,
                stub: true,
                tool: "list_tasks",
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}