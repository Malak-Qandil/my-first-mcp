import { McpServer } from "@modelcontextprotocol/server";
import { updateTaskInputSchema } from "../schemas/index.js";
import { updateExistingTask } from "../lib/tasks.js";

export function registerUpdateTaskTool(server: McpServer) {
  server.registerTool(
    "update_task",
    {
      description: "Update an existing task's title by ID",
      inputSchema: updateTaskInputSchema,
    },
    async ({ id, title, description }) => {
      try {
        const task = await updateExistingTask(id, title, description);

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
        console.error("update_task:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to update task",
            },
          ],
        };
      }
    },
  );
}
