#!/usr/bin/env tsx

/**
 * Test updating article description AND creating notebook notes
 */

import { updatePage, createHighlight } from '../lib/omnivore/client.js';
import { randomUUID } from 'crypto';

// Use the LLM Observability article
const articleId = '5977ff9f-01ea-4977-aa0e-1dbe43cd2a20';
const articleTitle = 'LLM Observability in the Wild - Why OpenTelemetry should be the Standard | SigNoz';

console.log(`\n🧪 Testing article notes update for: ${articleTitle}\n`);

// Test 1: Update article description (the "info" section in Omnivore UI)
console.log('1️⃣ Updating article description (Info section)...');

const updateResult = await updatePage({
  pageId: articleId,
  description: '🔍 WHY I SAVED THIS: Excellent deep dive into OpenTelemetry patterns for LLM observability. Potential for comparison post: OpenTelemetry vs proprietary solutions (Langfuse, Weights & Biases). Key insight: standardization matters more in LLM ops than traditional observability.'
});

console.log('   ✅ Description updated:', updateResult.updatedPage.description);

// Test 2: Create a NOTE highlight (the "Notebook" section in Omnivore UI)
console.log('\n2️⃣ Creating notebook note (NOTE highlight)...');

const noteId = randomUUID();
const shortId = Math.random().toString(36).substring(2, 10); // 8-char random string
const noteResult = await createHighlight({
  id: noteId,
  shortId: shortId,
  articleId: articleId,
  type: 'NOTE',
  annotation: '💡 CONTENT STRATEGY NOTE:\n\nThis article fits perfectly into our AI Infrastructure theme for the weekly roundup. Key angles:\n\n1. Comparison piece: OpenTelemetry vs Langfuse vs W&B\n2. Tutorial: Setting up OTel for LLM apps\n3. Opinion piece: Why standardization matters in AI ops\n\nTarget audience: ML engineers building production LLM apps\nEstimated value: High - trending topic, practical advice',
  quote: '', // Empty quote = standalone note
  patch: '',
  prefix: '',
  suffix: ''
});

console.log('   Result:', JSON.stringify(noteResult, null, 2));

console.log('\n📌 Check Omnivore UI to verify:');
console.log('   1. Description field shows "WHY I SAVED THIS" note');
console.log('   2. Notebook section shows the content strategy note');
console.log(`   Article ID: ${articleId}\n`);
