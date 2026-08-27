# Week 6 — Final Reflection

## Wins — What I Shipped

Over the six-week cohort, I built and shipped a complete MCP task-management server.

The project started as a simple task-management MCP server and grew into a more complete project with five MCP tools:

- `add_task` — creates a new task.
- `list_tasks` — lists tasks and supports status filtering.
- `complete_task` — marks a task as completed.
- `update_task` — updates an existing task.
- `delete_task` — deletes a task.

I also added input validation with Zod, structured error handling, secure file-path handling, and protections around network requests.

The project includes a local JSON data layer, documentation, examples, a threat model, a security policy, a manual test plan, and MCP Inspector test evidence.

I also built a professional web dashboard for interacting with the task-management functionality and prepared a 3–5 minute live MCP demo with presentation slides.

The final project was merged into `main`, published as a public GitHub repository, and tagged as `v1.0.0`.

The final project was successfully tested from a completely fresh clone using:

- `git clone`
- `npm install`
- `npm run dev`
- MCP Inspector

A real MCP tool call was also successfully verified from the fresh clone.

---

## Blockers — What Was Genuinely Hard

One of the hardest parts was making the project reliable outside my original development environment.

I encountered an issue where the server attempted to resolve the data path relative to the wrong working directory. This caused the server to look for the task data under the system directory instead of the project directory. I had to improve the file-path handling so that the server could safely resolve and access the correct data file.

Another challenge was handling Git branches and merge conflicts while combining work from different weeks. I learned how to resolve conflicts, complete merges, create pull requests, and keep the final branch clean.

Testing the MCP tools through MCP Inspector was also challenging because the tool inputs and validation behavior had to work correctly with the Inspector interface.

These challenges helped me understand that shipping a project is not only about writing code. Documentation, validation, security, testing, Git workflow, and verifying the project from a clean environment are all important parts of building a reliable software project.

---

## Resume Blurb

Built and shipped a public MCP task-management server using Model Context Protocol, TypeScript, and Zod, implementing five working tools for creating, listing, completing, updating, and deleting tasks. Added input validation, error handling, secure file-path handling, network protections, documentation, test evidence, and MCP Inspector integration. Published the project as a public GitHub repository with a `v1.0.0` release and verified installation and execution from a fresh clone.

---

## LinkedIn Draft

Over the past six weeks, I built and shipped my first complete MCP (Model Context Protocol) project.

I developed a task-management MCP server using TypeScript and Zod with five working tools: `add_task`, `list_tasks`, `complete_task`, `update_task`, and `delete_task`. Along the way, I worked on input validation, error handling, security hardening, documentation, MCP Inspector testing, Git workflows, and a web dashboard.

The project is now publicly available on GitHub, tagged as `v1.0.0`, and verified from a fresh clone. This experience gave me a much better understanding of how to take an AI-related software project from an initial idea through development, testing, documentation, and final public release.

---

## Next Two-Week Improvement

If I continued working on the project for the next two weeks, my main improvement would be replacing the local JSON storage with a proper database and adding automated tests with continuous integration.

This would make the project more reliable for larger task lists and future development, while automated tests would help prevent regressions when new MCP tools or features are added.

I would also improve the web dashboard so that it communicates directly with the MCP service and add additional task features such as search, priorities, deadlines, and reminders.