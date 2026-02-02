// AIDEV-NOTE: storage-reader; reads and parses Markdown files with YAML front-matter

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import type { AnalysisFrontMatter, StoredAnalysis } from '@omc-types/content.js';

export interface ContentReaderConfig {
  directory: string; // e.g., 'content/analysis'
}

export class ContentReader {
  private directory: string;

  constructor(config: ContentReaderConfig) {
    this.directory = config.directory;
  }

  /**
   * List all Markdown files in directory, sorted by date (newest first)
   * @param _pattern - Optional glob pattern (not implemented yet, just lists all)
   * @returns Array of file paths
   */
  async list(_pattern?: string): Promise<string[]> {
    try {
      const files = readdirSync(this.directory)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse(); // Newest first (assumes YYYY-MM-DD prefix)

      return files.map(f => join(this.directory, f));
    } catch (error) {
      // Directory doesn't exist yet
      return [];
    }
  }

  /**
   * Read and parse a Markdown file with front-matter
   * @param filePath - Absolute path to file
   * @returns StoredAnalysis with parsed front-matter and content sections
   */
  async read(filePath: string): Promise<StoredAnalysis> {
    const fileContent = readFileSync(filePath, 'utf-8');
    const parsed = matter(fileContent);

    // Extract sections from markdown body
    const sections = this.parseMarkdownSections(parsed.content);

    return {
      frontMatter: parsed.data as AnalysisFrontMatter,
      summary: sections.summary || '',
      keyPoints: sections.keyPoints || [],
      monetizationAngle: sections.monetizationAngle || ''
    };
  }

  /**
   * Find analysis by article ID
   * @param articleId - Omnivore article ID
   * @returns StoredAnalysis or null if not found
   */
  async findByArticleId(articleId: string): Promise<StoredAnalysis | null> {
    const files = await this.list();

    for (const filePath of files) {
      const analysis = await this.read(filePath);
      if (analysis.frontMatter.articleId === articleId) {
        return analysis;
      }
    }

    return null;
  }

  /**
   * Search analyses by topic
   * @param topic - Topic to search for
   * @returns Array of StoredAnalysis matching topic
   */
  async searchByTopic(topic: string): Promise<StoredAnalysis[]> {
    const files = await this.list();
    const results: StoredAnalysis[] = [];

    for (const filePath of files) {
      const analysis = await this.read(filePath);
      if (analysis.frontMatter.topics.includes(topic)) {
        results.push(analysis);
      }
    }

    return results;
  }

  /**
   * Parse markdown sections from body
   */
  private parseMarkdownSections(content: string): {
    summary?: string;
    keyPoints?: string[];
    monetizationAngle?: string;
  } {
    const sections: { summary?: string; keyPoints?: string[]; monetizationAngle?: string } = {};

    // Extract Summary
    const summaryMatch = content.match(/## Summary\s+([\s\S]*?)(?=\n##|$)/);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    // Extract Key Points
    const keyPointsMatch = content.match(/## Key Points\s+([\s\S]*?)(?=\n##|$)/);
    if (keyPointsMatch) {
      const pointsText = keyPointsMatch[1].trim();
      sections.keyPoints = pointsText
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    }

    // Extract Monetization Angle
    const monetizationMatch = content.match(/## Monetization Angle\s+([\s\S]*?)(?=\n##|$)/);
    if (monetizationMatch) {
      sections.monetizationAngle = monetizationMatch[1].trim();
    }

    return sections;
  }
}
