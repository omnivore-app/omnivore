# Automation Patterns (Codex CLI)

**Purpose**: Document the non-interactive automation path for daily analysis, and how it integrates with `codex exec`.

## Goal

Enable a fully schedulable workflow:

```bash
omc queue add --hours 24
omc analyze auto --batch-size 5
```

This replaces the interactive “Task tool / parallel agents” middle step.

## Key Design Constraints

- The analysis step must be **non-interactive** and runnable from cron/launchd.
- The LLM caller must **not mutate the repository** (safe-by-default).
- The CLI must remain usable as a “tool” inside future Codex sessions (content generation phase).

## Codex CLI Invocation

The automated analysis pipeline uses the local Codex CLI in non-interactive mode:

- Command: `codex exec`
- Sandbox: `-s read-only`
- Prompt input: stdin (`-`)

Important runtime behavior:

- Codex writes session files under `CODEX_HOME`. For scheduled runs, `CODEX_HOME` is set to a repo-local directory (`temp/codex-home`) so we don’t depend on `~/.codex/*` permissions.

## Implementation Notes

- LLM wrapper: `src/lib/ai/codex-cli-client.ts`
  - Builds a strict “JSON only” prompt.
  - Runs `codex exec` and parses the first JSON object from stdout.
- Analyzer: `src/analysis/ContentAnalyzer.ts`
  - Loads `src/analysis/prompts/analyze-article.md`
  - Calls the Codex CLI wrapper and normalizes required fields.
- Orchestration: `src/commands/analyze/auto.ts`
  - Selects jobs from SQLite queue
  - Fetches article content from Omnivore
  - Calls `ContentAnalyzer`
  - Persists results to Markdown + SQLite snapshot

