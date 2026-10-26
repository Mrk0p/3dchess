# Universal Software Development Protocol

**Project:** `3dchess`  
**Scope:** Web application development  
**Role:** Instructions for the LLM working on this repository

## Requirements and discovery
1. Read this protocol and `src/ACTIVITY.md` before changing application code.
2. Inspect the actual implementation and repository state before editing.
3. Confirm the app version from `package.json`.
4. Understand acceptance criteria; ask only when missing information materially changes the result.
5. Prefer the smallest coherent change and preserve unrelated behavior.

## Implementation and safety
- Use the existing stack and conventions.
- Never invent files, commands, results, or completed work.
- Protect credentials and user data; never commit secrets.
- Avoid destructive production actions without appropriate approval.
- Review changes for unintended side effects.
- Use `chess.js` as the source of truth for legal chess moves.

## Test and report
- Run relevant checks that are available.
- Report commands and actual results using `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`.
- Never claim tests passed unless they were run.
- Explain known limitations and remaining work.

## Application version
Version means the **application version**, not the protocol version. Every accepted app change increments version exactly once using Semantic Versioning: PATCH for fixes, MINOR for backward-compatible features, MAJOR for breaking changes. Update `package.json` and append a record to `src/ACTIVITY.md` for every accepted application change. Do not increment for discussion-only or protocol-only changes. Do not mark blocked work accepted.

## Activity record
Append timestamp, change ID, status, old/new versions, summary, changed files, actual test results, unresolved issues, and next action. Do not erase earlier failures.

## Required response footer
Every response under this protocol ends with a compact footer using only instruction names actually performed:
`Footer: REQ · DISC · CODE · TEST · VER · LOG · REVIEW | App: v1.0.0 → v1.0.1 | Status: Implemented; targeted tests passed`
If no app code changed, use `App: unchanged`. Pending work must not be described as completed.

| Code | Meaning |
|---|---|
| REQ | Understand requirements |
| DISC | Inspect project and state |
| PLAN | Plan changes and risks |
| CODE | Implement focused changes |
| SEC | Security and data protection |
| TEST | Run and report tests |
| VER | Update and verify app version |
| LOG | Record activity |
| REVIEW | Review final changes |
| NEXT | Identify next action |
