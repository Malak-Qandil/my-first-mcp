# Threat Model — my-first-mcp

## Assets

* `./data/todos.json` — contains the task data used by the MCP tools.
* The machine's filesystem — the server should not access files outside the intended data directory.
* Tool input and responses — invalid or unexpected input should not cause unsafe behavior or expose internal details.
* API responses — currently the project mainly uses local fixture data, but network access must still be protected if added later.
* Tokens and secrets — the project currently does not require API keys or stored secrets.

## Trust Boundaries

* Model → MCP tool arguments: tool arguments are untrusted and must be validated with Zod.
* MCP tools → filesystem: file access must be restricted to the intended `./data` directory.
* MCP tools → network: any future external request must use a timeout and validate the response before using it.

## Top 5 Risks

1. **Invalid tool input** — a model could send missing, unexpected, or invalid values to `add_task`, `list_tasks`, or `complete_task`.
2. **Path traversal** — future file-based functionality could be abused to access files outside the `./data` directory.
3. **Runaway responses** — a large task file or list could produce an unnecessarily large response to the model.
4. **Network timeout or unsafe response** — future API calls could hang or return unexpected data.
5. **Secret or internal information leakage** — error messages or logs could accidentally expose filesystem paths, tokens, or stack traces.

## Mitigations This Week

* Use Zod schemas to validate all tool inputs and data loaded from files.
* Restrict file access to the `./data` directory and reject paths containing traversal such as `..`.
* Limit returned lists to a reasonable number of items.
* Use request timeouts for network calls and validate external responses before using them.
* Log detailed errors only to stderr and return short, user-friendly error messages from tools.
* Keep secrets out of source code and repository files.

## Out of Scope

* Authentication and authorization are out of scope because this is a student MCP server running in a controlled development/demo environment.
* Database-level security is out of scope because the project currently uses a small local JSON fixture.
* Production infrastructure security is out of scope because the project is not deployed as a production service.
