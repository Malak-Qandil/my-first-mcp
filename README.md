# My First MCP

A simple MCP server for managing tasks.

## Tools

- `add_task` - create a new task
- `list_tasks` - list tasks with an optional status filter
- `complete_task` - mark an existing task as completed

## Requirements

- Node.js
- npm

No environment variables are currently required.

## Installation

Open a terminal in the project directory and install the dependencies:

npm install

## Run the MCP Server

Start the server with:

npm run dev

You should see:

my-first-mcp MCP server running on stdio

The server uses STDIO transport.

## Run with MCP Inspector

In a separate terminal, start the MCP Inspector with:

npx @modelcontextprotocol/inspector

The Inspector will open in your browser.

Add the server using:

- Transport: STDIO
- Command: npx
- Arguments: tsx src/index.ts
- Working directory: the root directory of this repository

Connect to the server.

You should see these tools:

- add_task
- list_tasks
- complete_task

## Tool Usage

### add_task

Creates a new task.

Example input:

{"title":"Finish MCP Week 5"}

The title must contain at least one non-whitespace character and can be at most 200 characters long.

### list_tasks

Lists tasks with an optional status filter.

The status value can be:

- all
- pending
- completed

Example input:

{"status":"pending"}

### complete_task

Marks an existing task as completed.

Example input:

{"id":"3"}

If the task ID does not exist, the server returns:

Task not found

## Data

Tasks are stored locally in:

data/todos.json

Example input files are available in:

examples/

They include:

- add_task.json
- list_tasks.json
- complete_task.json

## Troubleshooting

### The server does not start

Run:

npm install

Then:

npm run dev

### Inspector cannot connect

Check that:

1. The Inspector is running.
2. The transport is set to STDIO.
3. The command is npx.
4. The arguments are tsx src/index.ts.
5. The working directory is the repository root.

### A task is not found

Use list_tasks with status set to all, then find an existing task ID and use it with complete_task.

## Project Structure

my-first-mcp/
├── data/
│   └── todos.json
├── docs/
├── examples/
├── src/
│   ├── lib/
│   ├── schemas/
│   ├── tools/
│   └── index.ts
├── .env.example
├── package.json
├── README.md
└── SECURITY.md

## Security

See SECURITY.md for security controls and information about reporting issues.