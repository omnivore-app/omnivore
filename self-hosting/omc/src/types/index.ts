/**
 * Type definitions for Omnivore Content System
 *
 * Central export point for all type definitions.
 * Import from this file to access any type in the system.
 *
 * @example
 * ```typescript
 * import { OmnivoreArticle, ContentAnalysis, ArticleFrontMatter } from '@omc-types';
 * ```
 */

// Re-export all Omnivore API types
export * from './omnivore';

// Re-export all content storage types
export * from './content';

// Re-export all analysis types
export * from './analysis';

// Common utility types
export type DateString = string;  // ISO 8601 format (e.g., "2025-09-30T10:00:00Z")
export type UUID = string;        // Unique identifier
export type Slug = string;        // URL-friendly string (e.g., "ai-trends-2025")

/**
 * Configuration for blog post generation
 */
export interface BlogPostConfig {
  type: 'single-article' | 'weekly-roundup' | 'deep-dive';
  title?: string;                // Override auto-generated title
  targetWordCount?: number;      // Target length (default varies by type)
  includeSources?: boolean;      // Include source links (default true)
  seoOptimize?: boolean;         // Apply SEO optimization (default true)
}

/**
 * Configuration for newsletter generation
 */
export interface NewsletterConfig {
  type: 'weekly' | 'monthly';
  includeSections?: string[];    // Sections to include (e.g., ["topStories", "quickHits"])
  maxArticles?: number;          // Maximum articles to include
  personalCommentary?: boolean;  // Include personal notes (default true)
}

/**
 * Publishing platform options
 */
export type PublishingPlatform = 'markdown' | 'ghost' | 'wordpress' | 'medium';

/**
 * Publishing result
 */
export interface PublishResult {
  platform: PublishingPlatform;
  success: boolean;
  url?: string;                  // Published URL if successful
  error?: string;                // Error message if failed
  publishedAt: string;           // ISO timestamp
}
