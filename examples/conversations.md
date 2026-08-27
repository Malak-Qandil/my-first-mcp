# Example Conversations

These examples show how a model can use the MCP task-management tools to respond to natural-language requests.

## Conversation A - Add a Task

**User prompt:**

> Add a task called "Finish MCP Week 5 documentation."

**Expected tool call:**

1. `add_task`

   ```json
   {
     "title": "Finish MCP Week 5 documentation"
   }
   ```

**Good final answer:**

> Done - I added the task "Finish MCP Week 5 documentation."

## Conversation B - List Pending Tasks

**User prompt:**

> Show me all my pending tasks.

**Expected tool call:**

1. `list_tasks`

   ```json
   {
     "status": "pending"
   }
   ```

**Good final answer:**

> You have the following pending tasks: Finish MCP Week 5 documentation, test the MCP tools, and update the project documentation.

## Conversation C - Complete a Task

**User prompt:**

> Mark task 3 as completed.

**Expected tool call:**

1. `complete_task`

   ```json
   {
     "id": "3"
   }
   ```

**Good final answer:**

> Done - task 3 has been marked as completed.
