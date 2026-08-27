import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod/v4";
import { router } from "./routes.js";
import { TaskNotFoundError } from "./taskService.js";
import { McpToolError } from "./mcpClient.js";

const PORT = Number(process.env.PORT ?? 4000);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: WEB_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(express.json({ limit: "10kb" }));

// Basic abuse protection - the bridge only exposes 5 narrow task actions,
// but rate limiting keeps a runaway client from hammering the MCP process.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler: never leak stack traces or internals to the
// browser, matching the MCP tools' own "short, actionable message" policy.
app.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.issues.map((issue) => issue.message),
      });
      return;
    }

    // express.json() throws a SyntaxError for malformed request bodies -
    // that's a client mistake, not a server fault.
    if (err instanceof SyntaxError && "body" in (err as object)) {
      res.status(400).json({ error: "Malformed JSON in request body" });
      return;
    }

    if (err instanceof TaskNotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }

    if (err instanceof McpToolError) {
      res.status(502).json({ error: "The task server reported an error" });
      return;
    }

    console.error("Unhandled bridge error:", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`my-first-mcp bridge listening on http://localhost:${PORT}`);
  console.log(`Allowing requests from ${WEB_ORIGIN}`);
});
