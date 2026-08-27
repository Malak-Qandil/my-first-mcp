import { McpServer } from "@modelcontextprotocol/server";
import { addTaskInputSchema } from "../schemas/index.js";
import { addNewTask } from "../lib/tasks.js";

export function registerAddTaskTool(server: McpServer) {
  server.registerTool(
    "add_task",
    {
      description: "Create a new task",
      inputSchema: addTaskInputSchema,
    },
    async ({ title, description }) => {
      try {
        const task = await addNewTask(title, description);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(task, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("add_task:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to create task",
            },
          ],
        };
      }
    },
  );
}