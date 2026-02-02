# Archived Scripts

These scripts have been replaced by the new OCLIF-based CLI (`omc`). They are preserved here for reference but should not be used.

## Migration Map

| Old Script | New CLI Command |
|-----------|-----------------|
| `parallel-analyze.ts` | `omc analyze run` |
| `save-analysis-results.ts` | Internal (called by analyze run) |
| `retry-failed.ts` | `omc analyze retry` |
| `corpus-report.ts` | `omc report corpus` |
| `get-article-content.ts` | `omc omnivore get <slug>` |
| `get-article-notes.ts` | `omc omnivore note get <article-id>` |
| `test-update-article-notes.ts` | `omc omnivore note update <article-id>` |
| `update-note-test.ts` | `omc omnivore note update <article-id>` |
| `migrate-database.ts` | `omc db migrate` |

## Archived Date
2025-01-05

## Reason
All functionality has been migrated to the unified CLI system with better error handling, help text, and consistent interfaces.
