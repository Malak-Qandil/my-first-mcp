import { Router, type Request, type Response, type NextFunction } from "express";
import {
  addTaskInputSchema,
  updateTaskInputSchema,
} from "../../src/schemas/index.js";
import * as taskService from "./taskService.js";

export const router = Router();

function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Exposes the MCP server's own tools/list response, so the dashboard can
// show exactly what's registered - no hardcoded copy of tool metadata.
router.get(
  "/tools",
  asyncHandler(async (_req, res) => {
    const tools = await taskService.listRegisteredTools();
    res.json({ tools });
  }),
);

// list_tasks
router.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const tasks = await taskService.listTasks(status);
    res.json({ items: tasks });
  }),
);

// add_task
router.post(
  "/tasks",
  asyncHandler(async (req, res) => {
    const { title, description } = addTaskInputSchema.parse(req.body);
    const task = await taskService.addTask(title, description);
    res.status(201).json(task);
  }),
);

// update_task
router.patch(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const { title, description } = updateTaskInputSchema
      .pick({ title: true, description: true })
      .parse(req.body);
    const task = await taskService.updateTask(req.params.id, title, description);
    res.json(task);
  }),
);

// complete_task
router.post(
  "/tasks/:id/complete",
  asyncHandler(async (req, res) => {
    const task = await taskService.completeTask(req.params.id);
    res.json(task);
  }),
);

// delete_task
router.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const task = await taskService.deleteTask(req.params.id);
    res.json(task);
  }),
);
