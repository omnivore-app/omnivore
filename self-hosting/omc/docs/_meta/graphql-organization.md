# GraphQL Organization (Current)

This repo currently uses a single runtime GraphQL client:

- Runtime client: `lib/omnivore/client.js` (string-based GraphQL queries + `node-fetch`)
- TypeScript import surface: `src/lib/omnivore/client.ts` (re-exports runtime functions for TS/alias imports)

## Why

An earlier, typed GraphQL layer (`src/graphql/**` + `src/types/generated/**`) existed but was **not integrated** into the CLI runtime. Maintaining two parallel query stacks created drift risk without any runtime benefit.

To reduce duplication and keep docs aligned with reality, the typed layer was removed. If/when we migrate the runtime client to typed operations, we can reintroduce codegen + documents as part of that migration.

## How To Add/Change Fields

1. Update the query string in `lib/omnivore/client.js`.
2. If needed, update the corresponding TS types in `src/types/omnivore.ts`.
3. Prefer importing client functions from `@lib/omnivore/client.js` in TypeScript code.

