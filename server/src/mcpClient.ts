import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The MCP server lives one level up from server/, at the repository root.
// We never touch its filesystem or process directly from routes - only
// through this client, which speaks the same MCP protocol any other
// MCP host (Claude Desktop, MCP Inspector, etc.) would use.
const REPO_ROOT = path.resolve(__dirname, "../..");

export class ToolNotFoundError extends Error {}
export class McpToolError extends Error {}

let client: Client | null = null;
let connecting: Promise<Client> | null = null;

async function connect(): Promise<Client> {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/index.ts"],
    cwd: REPO_ROOT,
    stderr: "pipe",
  });

  const c = new Client({ name: "my-first-mcp-bridge", version: "1.0.0" });
  await c.connect(transport);

  transport.stderr?.on("data", (chunk) => {
    // Forward the MCP server's own stderr logging for observability.
    process.stderr.write(`[mcp-server] ${chunk}`);
  });

  c.onclose = () => {
    // Allow a fresh connection to be established on the next call.
    client = null;
  };

  return c;
}

async function getClient(): Promise<Client> {
  if (client) return client;
  if (!connecting) {
    connecting = connect()
      .then((c) => {
        client = c;
        return c;
      })
      .finally(() => {
        connecting = null;
      });
  }
  return connecting;
}

/**
 * Calls one of the 5 MCP tools (add_task, list_tasks, complete_task,
 * update_task, delete_task) exposed by the real stdio MCP server, and
 * returns its parsed result. This is the ONLY way this bridge talks to
 * task data - there is no direct filesystem access here.
 */
export async function callMcpTool<T = unknown>(
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const c = await getClient();

  const result = await c.callTool({ name, arguments: args });

  if (result.isError) {
    const message = extractText(result) ?? `Tool "${name}" reported an error`;
    throw new McpToolError(message);
  }

  const text = extractText(result);
  if (text === undefined) {
    throw new McpToolError(`Tool "${name}" returned no content`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // Some tool responses are plain text, e.g. "Task not found".
    return text as unknown as T;
  }
}

function extractText(result: unknown): string | undefined {
  const content = (result as { content?: unknown }).content;
  if (!Array.isArray(content)) return undefined;
  const block = content.find(
    (item): item is { type: "text"; text: string } =>
      typeof item === "object" &&
      item !== null &&
      (item as { type?: unknown }).type === "text" &&
      typeof (item as { text?: unknown }).text === "string",
  );
  return block?.text;
}

export async function listTools() {
  const c = await getClient();
  const result = await c.listTools();
  return result.tools;
}

export async function shutdownMcpClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
