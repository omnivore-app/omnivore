#!/usr/bin/env tsx
// AIDEV-NOTE: tracking-retry - resets failed jobs to pending for another attempt

import { initDatabase } from '../src/storage/database';
import { AnalysisQueueRepository } from '../src/storage/AnalysisQueueRepository';

const MAX_RETRIES = 3;

async function main() {
  const db = initDatabase();
  const queueRepo = new AnalysisQueueRepository(db);

  const failed = queueRepo.getFailed();

  if (failed.length === 0) {
    console.log('✓ No failed jobs to retry');
    db.close();
    return;
  }

  console.log('═'.repeat(80));
  console.log(`Found ${failed.length} failed jobs`);
  console.log('═'.repeat(80));

  let reset = 0;
  let skipped = 0;

  for (const job of failed) {
    if (job.retryCount < MAX_RETRIES) {
      queueRepo.resetToPending(job.articleId);
      console.log(`✓ Reset: ${job.articleTitle.substring(0, 50)}... (attempt ${job.retryCount + 2})`);
      reset++;
    } else {
      console.log(`✗ Skip: ${job.articleTitle.substring(0, 50)}... (max retries exceeded)`);
      skipped++;
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('Summary:');
  console.log(`  Reset for retry: ${reset}`);
  console.log(`  Skipped (max retries): ${skipped}`);
  console.log('═'.repeat(80));

  if (reset > 0) {
    console.log('\nRun: pnpm analyze:parallel');
  }

  db.close();
}

main().catch(console.error);
