import { readFile, writeFile } from "fs/promises";
import path from "path";
import { tasksSchema } from "../schemas/index.js";

const DATA_DIR = path.resolve("./data");
const FILE_PATH = path.resolve(DATA_DIR, "todos.json");

if (!FILE_PATH.startsWith(DATA_DIR + path.sep)) {
  throw new Error("Invalid data file path");
}

export async function loadTasks() {
  const data = await readFile(FILE_PATH, "utf-8");
  return tasksSchema.parse(JSON.parse(data));
}

export async function filterTasks(status?: string) {
  const tasks = await loadTasks();

  if (!status || status === "all") {
    return tasks.slice(0, 10);
  }

  return tasks
    .filter((task) => task.status === status)
    .slice(0, 10);
}

export async function addNewTask(title: string) {
  const tasks = await loadTasks();

  const newTask = {
    id: String(tasks.length + 1),
    title,
    status: "pending" as const,
  };

  tasks.push(newTask);

  await writeFile(
    FILE_PATH,
    JSON.stringify(tasks, null, 2),
    "utf-8",
  );

  return newTask;
}

export async function completeExistingTask(id: string) {
  const tasks = await loadTasks();

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return null;
  }

  task.status = "completed";

  await writeFile(
    FILE_PATH,
    JSON.stringify(tasks, null, 2),
    "utf-8",
  );

  return task;
}