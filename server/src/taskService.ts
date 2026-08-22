import {
  addTaskInputSchema,
  listTasksInputSchema,
  completeTaskInputSchema,
  updateTaskInputSchema,
  deleteTaskInputSchema,
  taskSchema,
} from "../../src/schemas/index.js";
import { callMcpTool, listTools } from "./mcpClient.js";

export type Task = {
  id: string;
  title: string;
  status: "pending" | "completed";
};

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task "${id}" was not found`);
  }
}

function isTaskNotFound(result: unknown): boolean {
  return typeof result === "string" && result.trim() === "Task not found";
}

function parseTask(result: unknown): Task {
  return taskSchema.parse(result) as Task;
}

export async function listRegisteredTools() {
  return listTools();
}

export async function listTasks(status?: string): Promise<Task[]> {
  const input = listTasksInputSchema.parse(
    status ? { status } : {},
  );
  const result = await callMcpTool<{ items: Task[] }>("list_tasks", input);
  return result.items;
}

export async function addTask(title: string): Promise<Task> {
  const input = addTaskInputSchema.parse({ title });
  const result = await callMcpTool("add_task", input);
  return parseTask(result);
}

export async function completeTask(id: string): Promise<Task> {
  const input = completeTaskInputSchema.parse({ id });
  const result = await callMcpTool("complete_task", input);
  if (isTaskNotFound(result)) throw new TaskNotFoundError(id);
  return parseTask(result);
}

export async function updateTask(id: string, title: string): Promise<Task> {
  const input = updateTaskInputSchema.parse({ id, title });
  const result = await callMcpTool("update_task", input);
  if (isTaskNotFound(result)) throw new TaskNotFoundError(id);
  return parseTask(result);
}

export async function deleteTask(id: string): Promise<Task> {
  const input = deleteTaskInputSchema.parse({ id });
  const result = await callMcpTool("delete_task", input);
  if (isTaskNotFound(result)) throw new TaskNotFoundError(id);
  return parseTask(result);
}
