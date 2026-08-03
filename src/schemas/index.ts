import * as z from "zod/v4";

// add_task tool input schema
export const addTaskInputSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .describe("The title of the task to create"),
});

// list_tasks tool input schema
export const listTasksInputSchema = z.object({
  status: z
    .enum(["all", "completed", "pending"])
    .optional()
    .describe("Filter tasks by their current status"),
});

// complete_task tool input schema
export const completeTaskInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .describe("The unique identifier of the task to mark as completed"),
});
