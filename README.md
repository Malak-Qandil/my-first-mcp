# My First MCP

A simple MCP server for managing tasks. It provides five tools for creating, listing, completing, updating, and deleting tasks stored locally in `data/todos.json`.

## Requirements

* Node.js
* npm

No environment variables are currently required.

## Install

Clone the repository and install the dependencies:

```bash
npm install
```

## Run

Start the MCP server with:

```bash
npm run dev
```

You should see:

```text
my-first-mcp MCP server running on stdio
```

The server uses STDIO transport.

## Run with MCP Inspector

In a separate terminal, start the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

In the Inspector, add the server using:

* **Transport:** STDIO
* **Command:** `npx`
* **Arguments:** `tsx src/index.ts`
* **Working directory:** the root directory of this repository

Connect to the server and verify that the five tools are available.

## Tools

| Tool | Description | Example input |
|---|---|---|
| `add_task` | Creates a new task | `{"title":"Finish MCP Week 5"}` |
| `list_tasks` | Lists tasks with an optional status filter | `{"status":"pending"}` |
| `complete_task` | Marks an existing task as completed | `{"id":"3"}` |
| `update_task` | Updates an existing task's title by ID | `{"id":"3","title":"Learn MCP Week 5"}` |
| `delete_task` | Deletes a task by its ID | `{"id":"3"}` |

### Input rules

* `add_task` requires a non-empty title after trimming and limits the title to 200 characters.
* `list_tasks` accepts `all`, `pending`, or `completed` as the status.
* `complete_task` requires a non-empty task ID.
* `update_task` requires a non-empty task ID and a non-empty title after trimming (max 200 characters).
* `delete_task` requires a non-empty task ID.

## Example Prompts

You can use prompts such as:

* "Add a task called Finish MCP Week 5."
* "List all pending tasks."
* "Mark task 3 as completed."
* "Update task 3 to Learn MCP Week 5."
* "Delete task 3."

## Troubleshooting

### 1. The server does not start

Make sure the dependencies are installed:

```bash
npm install
```

Then start the server again:

```bash
npm run dev
```

### 2. MCP Inspector cannot connect

Check that:

* The transport is set to **STDIO**.
* The command is `npx`.
* The argument is `tsx src/index.ts`.
* The working directory is the repository root.

### 3. A task is not found

Use `list_tasks` with:

```json
{"status":"all"}
```

Find an existing task ID, then use that ID with `complete_task`, `update_task`, or `delete_task`.

## License

This project is licensed under the MIT License.
