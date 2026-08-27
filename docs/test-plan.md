# Manual Test Plan

| id | tool | setup | input | expected | result | evidence |
|---|---|---|---|---|---|---|
| T01 | `add_task` | Server running; existing fixture data loaded | `examples/add_task.json` - `{"title":"Finish MCP Week 2 task"}` | A new task is added successfully and the created task is returned | PASS | T01-add-task-happy-path.png |
| T02 | `add_task` | Server running | `{"title":""}` | The tool rejects the input with a validation error and no task is added | PASS | T02-add-task-empty-input-validation.png |
| T03 | `add_task` | Server running | `{"title":"   "}` | The tool rejects whitespace-only input after trimming | PASS | T03-add-task-whitespace-validation.png |
| T04 | `list_tasks` | Server running; tasks exist in the data file | `examples/list_tasks.json` - `{"status":"pending"}` | The tool returns the pending tasks successfully | PASS | T04-list-tasks-pending.png |
| T05 | `complete_task` | Server running; task ID `3` exists | `{"id":"3"}` | The matching task is marked as completed and the updated task is returned | PASS | T05-complete-task-success.png |
| T06 | `complete_task` | Server running | `{"id":""}` | The tool rejects the input with a validation error and no task is modified | PASS | T06-complete-task-validation.png |
| T07 | `list_tasks` | Server running; data file reset to an empty list | `{"status":"all"}` | The tool returns an empty task list successfully without an error | PASS | T07-list-tasks-empty.png |
| T08 | `complete_task` | Server running; no task with ID `999` exists | `{"id":"999"}` | The tool returns `Task not found` without exposing a stack trace | PASS | T08-complete-task-not-found.png |