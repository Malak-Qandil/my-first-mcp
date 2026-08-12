Week 3 Data Plan

 P0 Tools

| Tool | Source | Fixture Path | Authentication | Rate Limits | Failure Modes | Example Response |
|---|---|---|---|---|---|---|
| add_task | Local JSON fixture | `data/todos.json` | None | None | Empty file; invalid JSON; failed write operation | `{ "id": "3", "title": "Study MCP", "status": "pending" }` |
| list_tasks | Local JSON fixture | `data/todos.json` | None | None | Empty file; invalid JSON; no matching tasks | `{ "items": [{ "id": "1", "title": "Finish MCP Week 3", "status": "pending" }] }` |
| complete_task | Local JSON fixture | `data/todos.json` | None | None | Task ID not found; invalid JSON; failed write operation | `{ "id": "1", "title": "Finish MCP Week 3", "status": "completed" }` |

 