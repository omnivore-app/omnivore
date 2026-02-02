import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
import { AnalysisWriter } from '../AnalysisWriter.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';

describe('AnalysisWriter.write front-matter', () => {
  it('produces YAML that round-trips through gray-matter for common edge cases', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'omc-frontmatter-'));
    try {
      const writer = new AnalysisWriter({ outputDir: join(dir, 'out') });
      const analysis = buildAnalysis('id-1');
      const path = await writer.write(
        'id-1',
        'https://example.com/a?x=1&y=two:three',
        'Title: "quotes" and colon: test',
        '2025-01-01T00:00:00.000Z',
        analysis,
        'omnivore-slug:with:colons'
      );

      const parsed = matter(readFileSync(path, 'utf-8'));
      expect(parsed.data.articleId).toBe('id-1');
      expect(parsed.data.articleSlug).toBe('omnivore-slug:with:colons');
      expect(parsed.data.articleUrl).toBe('https://example.com/a?x=1&y=two:three');
      expect(parsed.data.articleTitle).toBe('Title: "quotes" and colon: test');
      expect(parsed.data.topics).toEqual(['ai tooling', 'foo:bar', 'quoted "topic"']);
      expect(parsed.data.topicScores).toEqual({ 'ai tooling': 0.9, 'foo:bar': 0.8 });
      expect(parsed.data.problemStatement).toBe('N/A: "no problem"');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function buildAnalysis(articleId: string): ContentAnalysis {
  return {
    articleId,
    topics: ['ai tooling', 'foo:bar', 'quoted "topic"'],
    topicScores: { 'ai tooling': 0.9, 'foo:bar': 0.8 },
    sentiment: 'neutral',
    summary: 'Summary with a colon: and "quotes".',
    keyPoints: ['One: two', 'Quote "x"'],
    monetizationAngle: 'Angle',
    contentType: 'tutorial:advanced',
    problemStatement: 'N/A: "no problem"',
    audienceLevel: 'intermediate',
    technologiesMentioned: ['node.js', 'yaml:1.2'],
    companiesMentioned: ['ACME, Inc.'],
    peopleMentioned: [],
    conceptsExplained: ['front-matter'],
    relatedTechnologies: [],
    useCases: [],
    targetKeywords: ['a:b', 'c d'],
    searchQuestions: ['What is YAML?'],
    githubRepo: 'N/A',
    releaseInfo: 'N/A',
    analyzedAt: '2025-01-02T00:00:00.000Z',
  };
}

