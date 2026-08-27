# Week 4 Peer Review Checklist

## Peer Reviewer

**Name:** Entesar Qandil
**Project:** my-first-mcp
**Review:** Week 4 – Security Hardening
**Review method:** MCP Inspector and repository review

---

## P0 Tool Review

### 1. `add_task`

**Valid test**

**Input:**

```json
{
  "title": "Peer review test"
}
```

**Output:**

```json
{
  "id": "4",
  "title": "Peer review test",
  "status": "pending"
}
```

**Reviewer note:** The tool successfully created a new pending task.

**Invalid input test**

**Input:**

```json
{
  "title": ""
}
```

**Result:**

```text
Tool Error

Input validation error: Invalid arguments for tool add_task:
title: Too small: expected string to have >=1 characters
```

**Reviewer note:** The invalid input was rejected by schema validation and no task was created.

**Status:** ☑ Pass

---

### 2. `list_tasks`

**Input:**

```json
{
  "status": "all"
}
```

**Output:**

```json
{
  "items": [
    {
      "id": "1",
      "title": "Finish MCP Week 3",
      "status": "completed"
    },
    {
      "id": "2",
      "title": "Review TypeScript",
      "status": "completed"
    },
    {
      "id": "3",
      "title": "Learn MCP Week 3",
      "status": "pending"
    },
    {
      "id": "4",
      "title": "Peer review test",
      "status": "pending"
    }
  ]
}
```

**Reviewer note:** The tool returned the expected task structure and the result was within the configured response limit.

**Status:** ☑ Pass

---

### 3. `complete_task`

**Valid test**

**Input:**

```json
{
  "id": "4"
}
```

**Output:**

```json
{
  "id": "4",
  "title": "Peer review test",
  "status": "completed"
}
```

**Reviewer note:** The tool successfully completed the selected task.

**Nonexistent task test**

**Input:**

```json
{
  "id": "999"
}
```

**Result:**

```text
Task not found
```

**Reviewer note:** The tool returned a short error without exposing internal details.

**Path-like input test**

**Input:**

```json
{
  "id": "../etc/passwd"
}
```

**Result:**

```text
Task not found
```

**Reviewer note:** The path-like input did not result in filesystem access or an internal error response.

**Status:** ☑ Pass

---

## Security Checklist

| Area                     | Reviewer Notes                                                                               | Status |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------ |
| Input validation         | Zod validation reviewed, including required strings, maximum lengths, and fixed-value enums. | ☑ Pass |
| Invalid input handling   | Empty `add_task` title was rejected by Zod with a validation error.                          | ☑ Pass |
| Filesystem protection    | Task file uses `path.resolve` and the resolved path is checked to remain inside `./data`.    | ☑ Pass |
| Task-list response limit | Task-list responses are capped at 10 items.                                                  | ☑ Pass |
| Loaded task data limit   | Task data loaded from disk is capped at 1000 items by the schema.                            | ☑ Pass |
| Network allowlist        | HTTP helper uses an explicit host allowlist.                                                 | ☑ Pass |
| Network timeout          | HTTP requests use an 8-second timeout.                                                       | ☑ Pass |
| Disallowed host handling | Disallowed host test returned `Host is not allowed`.                                         | ☑ Pass |
| Error handling           | Tool errors are short and actionable and do not expose raw stack traces.                     | ☑ Pass |
| Secrets protection       | `.gitignore` protects `.env`, `.env.local`, and common key/secret files.                     | ☑ Pass |
| Environment example      | `.env.example` contains no real credentials or secret values.                                | ☑ Pass |
| Repository secret scan   | No accidental API keys or sensitive credentials were found.                                  | ☑ Pass |

---

## What Worked Well

* The three P0 tools were successfully exercised through MCP Inspector.
* Zod validation correctly rejected invalid input.
* Filesystem path protection was reviewed.
* Network host allowlisting and the timeout were reviewed.
* Tool errors are concise and do not expose internal implementation details.
* Secret and environment-file protections are in place.
* No accidental credentials were found in the repository.

---

## Issues Found

1. The README and demo instructions should remain synchronized with the current implementation.
2. Future tools should follow the same validation, error-handling, filesystem, network, and secret-management patterns.

---

## Recommended Follow-ups

* Keep the existing validation and security controls in place.
* Continue protecting file access and network requests.
* Ensure secrets are never committed to the repository.
* Update the README whenever the tools or demo flow changes.
* Add automated security tests in a future iteration to help prevent regressions.

---

## Action Items

| Action Item                                                             | Owner        | Due Date                   | Status      |
| ----------------------------------------------------------------------- | ------------ | -------------------------- | ----------- |
| Keep existing validation and security controls in place.                | Malak Qandil | End of Week 4 (2026-08-21) | ☑ Complete  |
| Continue protecting file access and network requests.                   | Malak Qandil | End of Week 4 (2026-08-21) | ☑ Complete  |
| Ensure secrets are never committed to the repository.                   | Malak Qandil | End of Week 4 (2026-08-21) | ☑ Complete  |
| Keep README and demo instructions synchronized with the implementation. | Malak Qandil | End of Week 4 (2026-08-21) | ☐ Follow-up |
| Add automated security tests in a future iteration.                     | Malak Qandil | Future iteration           | ☐ Follow-up |

---

## Peer Written Feedback

> I completed the peer review of the my-first-mcp project for Week 4 – Security Hardening. I walked through the three P0 tools using MCP Inspector and reviewed the security hardening changes.
>
> The three P0 tools were successfully exercised through MCP Inspector. Zod validation correctly rejected invalid input. Filesystem path protection was reviewed. Network host allowlisting and the timeout were reviewed. Tool errors are concise and do not expose internal implementation details. Secret and environment-file protections are in place, and no accidental credentials were found.
>
> The README and demo instructions should remain synchronized with the current implementation. Future tools should follow the same validation, error-handling, filesystem, network, and secret-management patterns.
>
> Recommended follow-ups are to keep the existing validation and security controls in place, continue protecting file access and network requests, ensure secrets are never committed, update the README whenever the tools or demo flow changes, and add automated security tests in a future iteration.
>
> Overall, the Week 4 security hardening looks good. The project can move forward after addressing the documented follow-up items.
>
> **Best,**
> **Entesar Qandil**

---

## Reviewer Confirmation

**Peer reviewer:** Entesar Qandil

**Review outcome:** Week 4 security hardening reviewed. No P0 issues identified.

**Reviewer conclusion:** The project can move forward after addressing the documented follow-up items.