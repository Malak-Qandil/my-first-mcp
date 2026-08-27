import { McpServer } from "@modelcontextprotocol/server";
import { deleteTaskInputSchema } from "../schemas/index.js";
import { deleteExistingTask } from "../lib/tasks.js";

export function registerDeleteTaskTool(server: McpServer) {
  server.registerTool(
    "delete_task",
    {
      description: "Delete a task by its ID",
      inputSchema: deleteTaskInputSchema,
    },
    async ({ id }) => {
      try {
        const task = await deleteExistingTask(id);

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
        console.error("delete_task:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to delete task",
            },
          ],
        };
      }
    },
  );
}
