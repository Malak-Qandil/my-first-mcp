# Week 3 Data Plan

 Tool: add_task

Source:
Local JSON file

Fixture path:
data/todos.json

Authentication:
none

Rate limits:
none

Failure modes:
- Empty file
- Invalid JSON format
- Failed write operation

Example response:
{
  "id": "3",
  "title": "Study MCP",
  "status": "pending"
}


Tool: list_tasks

Source:
Local JSON file

Fixture path:
data/todos.json

Authentication:
none

Rate limits:
none

Failure modes:
- Empty file
- Invalid JSON format
- No matching tasks

Example response:
[
  {
    "id": "1",
    "title": "Finish MCP Week 3",
    "status": "pending"
  }
]


Tool: complete_task

Source:
Local JSON file

Fixture path:
data/todos.json

Authentication:
none

Rate limits:
none

Failure modes:
- Task ID not found
- Invalid JSON format
- Failed write operation

Example response:
{
  "id": "1",
  "title": "Finish MCP Week 3",
  "status": "completed"
}