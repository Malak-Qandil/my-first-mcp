Week 3 Data Plan

add_task
- Source: Local JSON file
- Fixture path: data/todos.json
- Authentication: None
- Rate limits: None
- Happy path example: Creates a new task object and saves it into the JSON file.

list_tasks
- Source: Local JSON file
- Fixture path: data/todos.json
- Authentication: None
- Rate limits: None
- Happy path example: Reads the stored tasks from the JSON file and returns them.

complete_task
- Source: Local JSON file
- Fixture path: data/todos.json
- Authentication: None
- Rate limits: None
- Happy path example: Finds a task by ID and updates its status to completed.