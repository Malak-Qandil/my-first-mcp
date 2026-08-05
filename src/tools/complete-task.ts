import { McpServer } from "@modelcontextprotocol/server";
import { completeTaskInputSchema } from "../schemas/index.js";

export function registerCompleteTaskTool(server: McpServer) {
  server.registerTool(
    "complete_task",
    {
      description: "Mark a task as completed",
      inputSchema: completeTaskInputSchema,
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
                tool: "complete_task",
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