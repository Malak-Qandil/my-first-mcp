# Security Policy

## Supported Version

This security policy applies to the current version of this repository.

## Reporting a Security Issue

If you find a security issue in this project, please report it to:

Mjaradat@nextflows.ai

Please do not include real secrets or sensitive credentials in public issues.

## Security Hardening

This project currently does not require API keys or other secrets.

The following security controls are implemented:

- Zod input validation with minimum and maximum string lengths and fixed-value enums.
- File paths are resolved with `path.resolve` and restricted to the `./data` directory.
- Task-list responses are capped at 10 items.
- Task data loaded from disk is capped at 1000 items.
- Network requests use an explicit host allowlist.
- Network requests use an 8-second timeout.
- Tool errors return short, actionable messages instead of raw stack traces.
- `.env`, `.env.local`, and common key/secret files are excluded from Git.
- `.env.example` contains no real credentials or secret values.
