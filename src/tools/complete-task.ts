import { McpServer } from "@modelcontextprotocol/server";
import { completeTaskInputSchema } from "../schemas/index.js";
import { completeExistingTask } from "../lib/tasks.js";

export function registerCompleteTaskTool(server: McpServer) {
  server.registerTool(
    "complete_task",
    {
      description: "Mark a task as completed",
      inputSchema: completeTaskInputSchema,
    },
    async ({ id }) => {
      try {
        const task = await completeExistingTask(id);

        if (!task) {
          return {
            content: [
              {
                type: "text",
                text: "Task not found",
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("complete_task:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to complete task",
            },
          ],
        };
      }
    },
  );
}