// AIDEV-NOTE: analysis-output-boundary - writes to git-tracked Markdown/JSONL, NOT database
// AIDEV-NOTE: git-tracked-output - permanent storage for analysis results

import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';
import type { ContentAnalysis } from '@omc-types/analysis.js';

export interface AnalysisWriterConfig {
  outputDir: string; // e.g., 'content/analysis'
}

export interface AnalysisJsonlRecord {
  articleId: string;
  articleSlug?: string;
  articleUrl: string;
  articleTitle: string;
  savedAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  markdownPath?: string;
  analyzedAt: string;
  topics: string[];
  topicScores: Record<string, number>;
  sentiment: string;
  summary: string;
  keyPoints: string[];
  monetizationAngle: string;
  contentType: string;
  problemStatement: string;
  audienceLevel: string;
  technologiesMentioned: string[];
  companiesMentioned: string[];
  peopleMentioned: string[];
  conceptsExplained: string[];
  relatedTechnologies: string[];
  useCases: string[];
  targetKeywords: string[];
  searchQuestions: string[];
  githubRepo: string;
  releaseInfo: string;
}

export class AnalysisWriter {
  private outputDir: string;

  constructor(config: AnalysisWriterConfig) {
    this.outputDir = config.outputDir;

    // Ensure output directory exists
    mkdirSync(this.outputDir, { recursive: true });
  }

  /**
   * Write ContentAnalysis to Markdown file with YAML front-matter
   * @param articleId - Omnivore article ID
   * @param articleUrl - Source article URL
   * @param articleTitle - Source article title
   * @param savedAt - When article was saved to Omnivore
   * @param analysis - ContentAnalysis from Claude
   * @param articleSlug - Optional Omnivore slug (preferred for filename stability)
   * @returns File path where analysis was written
   */
  async write(
    articleId: string,
    articleUrl: string,
    articleTitle: string,
    savedAt: string,
    analysis: ContentAnalysis,
    articleSlug?: string
  ): Promise<string> {
    const slug = this.generateSlug(articleSlug ?? articleTitle);
    const date = new Date(savedAt).toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${date}-${slug}-analysis.md`;
    const filePath = join(this.outputDir, filename);

    const content = this.formatMarkdown(
      articleId,
      articleUrl,
      articleTitle,
      savedAt,
      analysis,
      articleSlug
    );

    writeFileSync(filePath, content, 'utf-8');

    return filePath;
  }

  /**
   * Generate URL-friendly slug from article title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
      .substring(0, 50);             // Limit length
  }

  /**
   * Format ContentAnalysis as Markdown with YAML front-matter
   */
  private formatMarkdown(
    articleId: string,
    articleUrl: string,
    articleTitle: string,
    savedAt: string,
    analysis: ContentAnalysis,
    articleSlug?: string
  ): string {
    const frontMatter = {
      articleId,
      articleSlug: articleSlug ?? undefined,
      articleUrl,
      articleTitle,
      savedAt,
      analyzedAt: analysis.analyzedAt,
      topics: analysis.topics,
      topicScores: analysis.topicScores,
      sentiment: analysis.sentiment,
      contentType: analysis.contentType,
      problemStatement: analysis.problemStatement,
      audienceLevel: analysis.audienceLevel,
      technologiesMentioned: analysis.technologiesMentioned,
      companiesMentioned: analysis.companiesMentioned,
      peopleMentioned: analysis.peopleMentioned,
      conceptsExplained: analysis.conceptsExplained,
      relatedTechnologies: analysis.relatedTechnologies,
      useCases: analysis.useCases,
      targetKeywords: analysis.targetKeywords,
      searchQuestions: analysis.searchQuestions,
      githubRepo: analysis.githubRepo,
      releaseInfo: analysis.releaseInfo,
    };

    const bodyLines = [
      '## Summary',
      '',
      analysis.summary,
      '',
      '## Key Points',
      '',
      ...analysis.keyPoints.map((point) => `- ${point}`),
      '',
      '## Monetization Angle',
      '',
      analysis.monetizationAngle,
      '',
    ];

    return matter.stringify(bodyLines.join('\n'), frontMatter);
  }

  /**
   * Append analysis to JSONL file for machine-readable storage
   * AIDEV-NOTE: git-tracked-output - JSONL format for batch processing
   *
   * @param jsonlPath - Path to JSONL file (e.g., 'content/analysis/analyses.jsonl')
   * @param data - Complete analysis data with metadata
   */
  async appendToJsonl(
    jsonlPath: string,
    data: AnalysisJsonlRecord
  ): Promise<void> {
    // Ensure directory exists
    const dir = dirname(jsonlPath);
    mkdirSync(dir, { recursive: true });

    // Create file if it doesn't exist
    if (!existsSync(jsonlPath)) {
      writeFileSync(jsonlPath, '', 'utf-8');
    }

    // Append JSON line
    const jsonLine = JSON.stringify(data) + '\n';
    appendFileSync(jsonlPath, jsonLine, 'utf-8');
  }
}
