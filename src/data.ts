import { readFile, writeFile } from "fs/promises";
import { tasksSchema } from "./schemas/index.js";

const FILE_PATH = "./data/todos.json";

export async function readTasks() {
  try {
    const data = await readFile(FILE_PATH, "utf-8");
    return tasksSchema.parse(JSON.parse(data));
  } catch (error) {
    console.error("readTasks:", error);
    return [];
  }
}
export async function writeTasks(tasks: unknown) {
  await writeFile(
    FILE_PATH,
    JSON.stringify(tasks, null, 2),
    "utf-8",
  );
}