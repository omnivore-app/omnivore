#!/usr/bin/env tsx
// AIDEV-NOTE: tracking-coordination - uses SQLite queue for parallel execution
// AIDEV-NOTE: analysis-output-boundary - results written to Markdown/JSONL, NOT database
// AIDEV-NOTE: omnivore-boundary - fetches articles via GraphQL API, never local cache

import { getArticle, getMe } from '../lib/omnivore/client.js';
import { initDatabase } from '../src/storage/database';
import { AnalysisQueueRepository } from '../src/storage/AnalysisQueueRepository';
import { AnalysisWriter } from '../src/storage/AnalysisWriter';
import type { ContentAnalysis } from '../src/types/analysis';
import { writeFileSync, mkdirSync } from 'fs';
import 'dotenv/config';

const BATCH_SIZE = 5;  // Process 5 articles in parallel

async function main() {
  // AIDEV-NOTE: tracking-db - coordination only, not analysis storage
  const db = initDatabase();
  const queueRepo = new AnalysisQueueRepository(db);

  const stats = queueRepo.getStats();
  console.log('═'.repeat(80));
  console.log('Analysis Queue Status');
  console.log('═'.repeat(80));
  console.log(`  Total: ${stats.total}`);
  console.log(`  Pending: ${stats.pending}`);
  console.log(`  In Progress: ${stats.inProgress}`);
  console.log(`  Completed: ${stats.completed}`);
  console.log(`  Failed: ${stats.failed}`);

  if (stats.pending === 0) {
    console.log('\n✓ No pending analyses');
    db.close();
    return;
  }

  // Get next batch
  // AIDEV-NOTE: tracking-batch - fetch jobs for parallel processing
  const jobs = queueRepo.getPending(BATCH_SIZE);
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`Created ${jobs.length} stub files for parallel analysis...`);
  console.log('─'.repeat(80));

  // Mark as in_progress (coordination lock)
  // AIDEV-NOTE: tracking-lock - prevents duplicate analysis by concurrent runs
  for (const job of jobs) {
    queueRepo.markInProgress(job.articleId);
  }

  // AIDEV-NOTE: gql-article-query - get username from authenticated user
  const me = await getMe();
  const username = me.profile.username;

  // Create temp directory for stub files
  mkdirSync('temp', { recursive: true });

  // AIDEV-NOTE: stub-file-creation - fetch articles and populate complete metadata
  const agentParams = [];

  for (let index = 0; index < jobs.length; index++) {
    const job = jobs[index];
    const filename = `temp/${job.articleSlug}.jsonl`;

    console.log(`Fetching article ${index + 1}/${jobs.length}: ${job.articleTitle.substring(0, 60)}...`);

    // Fetch article to get publishedAt/updatedAt
    const result = await getArticle(job.articleSlug, username);

    // Write complete stub JSONL with all metadata
    const stub = {
      articleId: job.articleId,
      articleSlug: job.articleSlug,
      username: username,
      articleUrl: result.article.url,
      articleTitle: result.article.title,
      savedAt: result.article.savedAt,
      publishedAt: result.article.publishedAt || null,
      updatedAt: result.article.updatedAt || null
    };

    writeFileSync(filename, JSON.stringify(stub) + '\n', 'utf-8');

    // Return metadata for agent invocation
    agentParams.push({
      filename: filename,
      articleId: job.articleId,
      articleSlug: job.articleSlug,
      username: username,
      articleTitle: result.article.title.substring(0, 60) + '...' // truncated for display
    });
  }

  console.log(JSON.stringify(agentParams, null, 2));

  db.close();
}

main().catch(console.error);
