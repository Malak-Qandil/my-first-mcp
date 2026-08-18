# Manual Test Plan

| id | tool | setup | input | expected | result | evidence |
|---|---|---|---|---|---|---|
| T01 | `add_task` | Server running; existing fixture data loaded | `examples/add_task.json` - `{"title":"Finish MCP Week 2 task"}` | A new task is added successfully and the created task is returned | PASS | Screenshot: T01 add_task happy path |
| T02 | `add_task` | Server running | `{"title":""}` | The tool rejects the input with a validation error and no task is added | PASS | Screenshot: T02 add_task validation rejection |
| T03 | `add_task` | Server running | `{"title":"   "}` | The tool rejects whitespace-only input after trimming | PASS | Inspector result: whitespace-only title rejected |
| T04 | `list_tasks` | Server running; tasks exist in the data file | `examples/list_tasks.json` - `{"status":"pending"}` | The tool returns the pending tasks successfully | PASS | Inspector result: pending tasks returned |
| T05 | `complete_task` | Server running; task ID `3` exists | `{"id":"3"}` | The matching task is marked as completed and the updated task is returned | PASS | Inspector result: task 3 returned with completed status |
| T06 | `complete_task` | Server running | `{"id":""}` | The tool rejects the input with a validation error and no task is modified | PASS | Screenshot: T06 complete_task validation rejection |
| T07 | `list_tasks` | Server running; data file reset to an empty list | `{"status":"all"}` | The tool returns an empty task list successfully without an error | PASS | Screenshot: T07 empty-data result |
| T08 | `complete_task` | Server running; no task with ID `999` exists | `{"id":"999"}` | The tool returns `Task not found` without exposing a stack trace | PASS | Inspector result: Task not found |