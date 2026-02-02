#!/usr/bin/env tsx
// AIDEV-NOTE: analysis-output-boundary - saves results to git-tracked Markdown/JSONL
// AIDEV-NOTE: tracking-update - updates SQLite queue status after save

import { readFileSync, unlinkSync } from 'fs';
import { initDatabase } from '../src/storage/database';
import { AnalysisQueueRepository } from '../src/storage/AnalysisQueueRepository';
import { AnalysisWriter } from '../src/storage/AnalysisWriter';
import type { ContentAnalysis } from '../src/types/analysis';

interface EnrichedResult {
  articleId: string;
  articleSlug: string;
  username: string;
  articleUrl: string;
  articleTitle: string;
  savedAt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  analysis: ContentAnalysis;
}

async function main() {
  const patterns = process.argv.slice(2);

  if (patterns.length === 0) {
    patterns.push('temp/*.jsonl'); // Default: all JSONL files in temp/
  }

  // Read all matching JSONL files from all patterns
  const { globSync } = await import('glob');
  const files = patterns.flatMap(pattern => globSync(pattern));

  if (files.length === 0) {
    console.error(`No files found matching patterns: ${patterns.join(', ')}`);
    process.exit(1);
  }

  const resultsWithFiles: Array<{ result: EnrichedResult; file: string }> = files.map(file => {
    const content = readFileSync(file, 'utf-8');
    return { result: JSON.parse(content), file };
  });

  console.log(`Loaded ${resultsWithFiles.length} enriched analysis results from ${files.length} files`);

  // AIDEV-NOTE: tracking-db - coordination only
  const db = initDatabase();
  const queueRepo = new AnalysisQueueRepository(db);

  // AIDEV-NOTE: analysis-output - permanent git-tracked storage
  const writer = new AnalysisWriter({ outputDir: 'content/analysis' });

  let saved = 0;
  let failed = 0;

  for (const { result, file } of resultsWithFiles) {
    const { articleId, articleUrl, articleTitle, savedAt, publishedAt, updatedAt, analysis } = result;

    try {
      // Write to Markdown (git-tracked, human-editable)
      const mdPath = await writer.write(
        articleId,
        articleUrl,
        articleTitle,
        savedAt,
        analysis
      );

      // Store in database (immutable AI snapshot)
      queueRepo.storeAnalysis(
        articleId,
        publishedAt,
        updatedAt,
        JSON.stringify(analysis),
        mdPath
      );

      // Remove temp file after successful save
      unlinkSync(file);

      console.log(`✓ Saved: ${articleTitle.substring(0, 60)}...`);
      saved++;
    } catch (err: any) {
      // Mark as failed in tracking DB
      queueRepo.markFailed(articleId, `Save failed: ${err.message}`);
      console.error(`✗ Failed: ${articleTitle.substring(0, 60)}... - ${err.message}`);
      failed++;
    }
  }

  // Show updated stats
  const stats = queueRepo.getStats();
  console.log(`\n${'═'.repeat(80)}`);
  console.log('Results:');
  console.log(`  Saved: ${saved}`);
  console.log(`  Failed: ${failed}`);
  console.log('\nUpdated Queue Status:');
  console.log(`  Pending: ${stats.pending}`);
  console.log(`  Completed: ${stats.completed}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log('═'.repeat(80));

  db.close();
}

main().catch(console.error);
