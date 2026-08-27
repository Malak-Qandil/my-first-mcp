# MCP Task Management — Demo Script

## Demo Goal

Demonstrate a simple MCP task-management server that allows an AI model to manage tasks using MCP tools.

Total demo time: 5 minutes maximum.

---

## 0:00–0:40 — The Problem

### What to say

Many people manage tasks manually across notes, messages, and different applications.

The problem is that the task list is not directly connected to an AI assistant.

For this project, I built an MCP task-management server that gives an AI model direct access to task-management tools.

The server stores tasks locally and exposes five tools:

- `add_task`
- `list_tasks`
- `complete_task`
- `update_task`
- `delete_task`

The goal is to make task management simple and accessible through natural-language requests.

---

## 0:40-1:10 -Architecture

### What to show

Show the architecture slide.

### What to say

The architecture has three main parts.

First, the user communicates with an AI client using natural language.

Second, the AI client communicates with my MCP server through the MCP protocol.

Third, the MCP server uses the task service and local JSON storage to read and modify the tasks.

The MCP server validates tool inputs before performing operations, and the project also includes security protections for file paths and network requests.

---

## 1:10–3:30 — Live Demo

The live demo uses two primary prompts from `examples/conversations.md`, with one backup prompt.

### Live Prompt 1 — List Pending Tasks

**Time:** 1:10–2:00

**Prompt:**

> Show me all my pending tasks.

### Expected tool

`list_tasks`

### Input

```json
{
  "status": "pending"
}
What to say

The natural-language request is mapped to the list_tasks MCP tool.

The tool receives the pending status filter and returns the tasks that are currently pending.

This demonstrates reading task data through MCP.

Live Prompt 2 — Add a Task

Time: 2:00–3:00

Prompt:

Add a task called "Finish MCP Week 5 documentation."

Expected tool

add_task

Input
{
  "title": "Finish MCP Week 5 documentation"
}
What to say

Now I will create a new task using natural language.

The AI maps the request to the add_task tool.

The server validates the title, creates the task, and stores it in the local JSON file.

This demonstrates how an AI client can modify persistent task data through MCP.

Backup Prompt — Complete a Task

Time: Use only if one of the primary demonstrations fails.

Prompt:

Mark task 3 as completed.

Expected tool

complete_task

Input
{
  "id": "3"
}
What to say

As a backup, I can demonstrate completing an existing task.

The AI maps the request to complete_task, which validates the task ID and updates the task status to completed.

3:00–3:30 — Five Tools Summary
What to show

Show the tools table slide.

What to say

The server provides five task-management tools.

add_task creates a task.

list_tasks retrieves tasks and supports status filtering.

complete_task marks a task as completed.

update_task changes the title of an existing task.

delete_task removes a task by ID.

Together, these tools provide the core CRUD-style operations needed for task management.

3:30–4:30 — What I Would Build Next
What to show

Show the next steps slide.

What to say

There are several improvements I would build next.

First, I would add a database instead of local JSON storage to support larger task lists and multiple users.

Second, I would add authentication and user-specific task lists.

Third, I would improve the web dashboard and connect it more directly to the MCP service.

Fourth, I would add automated tests and continuous integration to make future changes safer.

Finally, I would consider adding features such as task search, priorities, deadlines, and reminders.

4:30–5:00 — Questions
What to say

That concludes the demo.

The project is publicly available on GitHub and can be installed and run from a fresh clone.

The MCP server can be tested using MCP Inspector, and the project includes documentation, examples, security considerations, and test evidence.

Thank you. I am happy to answer any questions.

Backup Plan — Offline Demo

If Wi-Fi or external services are unavailable, use the local MCP server and local data/todos.json file.

The MCP server does not require an external database or API for the core task-management tools.

The demo can therefore continue using the local task fixtures and MCP Inspector.

Rehearsal Checklist

Before Demo Day:

 Rehearse the full demo twice.
 Use a timer.
 Keep the demo between 3 and 5 minutes.
 Verify the MCP server starts with npm run dev.
 Verify MCP Inspector can connect.
 Test the two primary prompts.
 Test the backup prompt.
 Confirm data/todos.json contains usable test data.
 Keep the backup/offline path ready.
 Open the slides before starting the demo.
 Keep the GitHub repository ready in another browser tab.