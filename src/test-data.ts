import { loadTasks } from "./lib/tasks.js";

const tasks = await loadTasks();

console.log(tasks);