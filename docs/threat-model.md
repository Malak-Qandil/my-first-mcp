# Threat Model — my-first-mcp

## Assets

- `./data/todos.json` — contains the task data used by the three P0 tools.

- The machine's filesystem — file access must stay limited to the intended data directory.

- Tool inputs and responses — invalid input or unexpected data must not cause unsafe behavior or expose internal details.

- External API responses — network data must be treated as untrusted if an API is used.

- Tokens and secrets — the project currently does not use API keys or stored secrets.

## Trust Boundaries

- Model -> MCP tool arguments: tool arguments are untrusted and must be validated before use.

- MCP tools -> filesystem: tool file access crosses into the local filesystem and must be restricted to `./data`.

- MCP tools -> network: external responses are untrusted and network requests must have a timeout and validated response shape.

## Top 5 Risks

1. **Invalid tool input** — a model could send missing, unexpected, or invalid values to `add_task`, `list_tasks`, or `complete_task`.

2. **Path traversal** — a file path could contain `..` and attempt to access files outside the intended `./data` directory.

3. **Runaway responses** — a large file or task list could produce an unnecessarily large response for the model.

4. **Network failures or invalid API data** — an external request could hang, fail, or return data that does not match the expected schema.

5. **Secret or internal information leakage** — errors or logs could expose filesystem paths, tokens, or stack traces.

## Mitigations This Week

- Use Zod schemas to validate all tool inputs and data loaded from files. String inputs have maximum lengths, fixed values use enums, and required strings reject empty values.

- Resolve the data file path with `path.resolve` and verify that the resolved path stays inside the `./data` directory.

- Cap task-list responses to 10 items to prevent unnecessarily large model responses. Task data is also capped at 1000 items by the data schema.

- The network helper uses an explicit host allowlist and an 8-second timeout. Requests to hosts that are not allowlisted are rejected before the network request is made. The helper is currently not used by any MCP tool.

- Log detailed failures only to stderr and return short, actionable error messages to the model. Raw stack traces and internal error details are not returned to the model.

- Keep tokens and secrets out of source code, logs, and repository files.

## Out of Scope

- Authentication and authorization are out of scope because this is a student MCP server running in a controlled development/demo environment.

- Database security is out of scope because the project currently uses a small local JSON fixture.

- Production infrastructure and deployment security are out of scope because the project is not deployed as a production service.