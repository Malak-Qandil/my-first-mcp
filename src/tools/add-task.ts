import { McpServer } from "@modelcontextprotocol/server";
import { addTaskInputSchema } from "../schemas/index.js";

export function registerAddTaskTool(server: McpServer) {
  server.registerTool(
    "add_task",
    {
      description: "Create a new task",
      inputSchema: addTaskInputSchema,
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
                tool: "add_task",
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