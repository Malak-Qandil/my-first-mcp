import { McpServer } from "@modelcontextprotocol/server";
import { listTasksInputSchema } from "../schemas/index.js";
import { filterTasks } from "../lib/tasks.js";

export function registerListTasksTool(server: McpServer) {
  server.registerTool(
    "list_tasks",
    {
      description: "List tasks with optional status filter",
      inputSchema: listTasksInputSchema,
    },
    async ({ status }) => {
      try {
        const tasks = await filterTasks(status);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  items: tasks,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        console.error("list_tasks:", error);

        return {
          content: [
            {
              type: "text",
              text: "Failed to load tasks",
            },
          ],
        };
      }
    },
  );
}