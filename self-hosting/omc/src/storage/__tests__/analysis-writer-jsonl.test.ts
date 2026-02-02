import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AnalysisWriter } from '../AnalysisWriter.js';
import type { AnalysisJsonlRecord } from '../AnalysisWriter.js';

describe('AnalysisWriter.appendToJsonl', () => {
  it('appends one JSON object per line', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'omc-jsonl-'));
    try {
      const writer = new AnalysisWriter({ outputDir: join(dir, 'out') });
      const jsonlPath = join(dir, 'analyses.jsonl');
      const record1 = buildRecord('a1');
      const record2 = buildRecord('a2');

      await writer.appendToJsonl(jsonlPath, record1);
      await writer.appendToJsonl(jsonlPath, record2);

      const lines = readFileSync(jsonlPath, 'utf-8').trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0])).toEqual(record1);
      expect(JSON.parse(lines[1])).toEqual(record2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function buildRecord(articleId: string): AnalysisJsonlRecord {
  return {
    articleId,
    articleSlug: 'test-slug',
    articleUrl: 'https://example.com',
    articleTitle: 'Test',
    savedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    publishedAt: null,
    updatedAt: null,
    markdownPath: 'content/analysis/2025-01-01-test-analysis.md',
    analyzedAt: new Date('2025-01-02T00:00:00Z').toISOString(),
    topics: ['ai'],
    topicScores: { ai: 0.9 },
    sentiment: 'neutral',
    summary: 'Summary',
    keyPoints: ['One'],
    monetizationAngle: 'Angle',
    contentType: 'N/A',
    problemStatement: 'N/A',
    audienceLevel: 'N/A',
    technologiesMentioned: [],
    companiesMentioned: [],
    peopleMentioned: [],
    conceptsExplained: [],
    relatedTechnologies: [],
    useCases: [],
    targetKeywords: [],
    searchQuestions: [],
    githubRepo: 'N/A',
    releaseInfo: 'N/A',
  };
}

