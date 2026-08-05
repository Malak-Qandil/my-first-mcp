# To-Do List MCP Design

## Pitch

Many students struggle with organizing daily tasks and keeping track of what needs to be done.
This project is a To-Do List MCP server designed for students and individuals who want a simple task management assistant.
The MCP exposes tools that allow users to create, view, complete, and delete tasks through an AI model.

## User & Demo Story

During Demo Day, a student asks: "What tasks do I still need to finish today?"
The AI uses list_tasks to retrieve the current tasks and shows the user the remaining work.
The user then says "Add a task to study for the exam", so the AI calls add_task and confirms the new task was created.
If the student finishes a task, the AI uses complete_task to update its status.

## Tool Inventory

| tool_name | description | inputs | output (shape) | priority |
|---|---|---|---|---|
| add_task | Creates a new task and saves it to the user's task list. | title: string | Created task object | P0 |
| list_tasks | Returns all tasks stored in the to-do list. | none | Array of tasks | P0 |
| complete_task | Marks a task as completed. | id: string | Updated task object | P0 |
| delete_task | Removes a task from the to-do list. | id: string | Confirmation message | P1 |
| search_tasks | Finds tasks matching a keyword. | query: string | Matching tasks array | P1 |

## Out of Scope

- User authentication and accounts.
- Mobile application development.
- Paid APIs or external cloud services.
- Notifications and reminders.

## Success Criteria

- [ ] User can create a new task successfully.
- [ ] User can view existing tasks through the MCP tool.
- [ ] User can complete a task and see the updated status in a live demo.

## Risks

1. Data storage complexity may slow development.
   - Mitigation: Start with simple local storage or fixture data.

2. Tool schema changes may require updates later.
   - Mitigation: Keep tools small and follow clear input/output designs.


# Design Notes

## Notes from reading MCP example servers

- Tool names usually follow a clear action-based naming pattern using lowercase and underscores, such as `list_items` or `create_item`.

- Tool descriptions are short but specific, explaining what the tool does and what kind of input it expects.

- Tools are organized separately to keep the server structure clean and make adding new tools easier.

- Error messages should clearly explain what went wrong and help users understand how to fix invalid inputs.

- Input schemas are designed carefully with validation rules and descriptions so the model can understand how to call each tool correctly.
