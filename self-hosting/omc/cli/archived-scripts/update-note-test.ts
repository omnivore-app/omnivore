#!/usr/bin/env tsx

/**
 * Update a note with Markdown to test format
 */

import { updateHighlight } from '../lib/omnivore/client.js';

const noteId = '922361d2-f09c-4b81-8826-396de3690c5d';

const markdown = `# Analysis Report

**Article**: LLM Observability
**Status**: High Priority

## Key Insights

1. **OpenTelemetry vs OpenInference** - competing standards
2. **Ruby SDK gap** - No OpenInference support
3. **Production debugging** - Visibility challenges

## Content Strategy

- [ ] Write comparison post
- [ ] Tutorial on OTel setup
- [ ] Interview Pranav

### Target Audience
ML engineers building production LLM apps

*Last updated: 2025-10-02*
`;

console.log('Updating note with Markdown...\n');

const result = await updateHighlight({
  highlightId: noteId,
  annotation: markdown
});

console.log('Result:', JSON.stringify(result, null, 2));
console.log('\nCheck Omnivore UI to see how the Markdown renders!');
