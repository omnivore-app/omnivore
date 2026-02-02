/**
 * Content Storage Type Definitions
 *
 * Types for Markdown file storage with YAML front-matter.
 * The content system uses front-matter + Git instead of a database.
 */

/**
 * Front-matter metadata for stored articles
 * Saved as YAML at the top of Markdown files in content/articles/
 */
export interface ArticleFrontMatter {
  id: string;                    // Omnivore article ID
  url: string;                   // Original article URL
  title: string;
  author?: string;
  savedAt: string;               // ISO timestamp when saved to Omnivore
  publishedAt?: string;          // Original publication date
  labels: string[];              // Label names (not IDs)
  highlights: number;            // Count of highlights
  wordCount: number;
  siteName?: string;             // Source website name
  topics?: string[];             // Added by analysis phase
  sentiment?: string;            // Added by analysis phase
  analyzed?: boolean;            // Whether analysis has been run
}

/**
 * Front-matter metadata for analysis results
 * Saved in content/analysis/ with same filename as article
 */
export interface AnalysisFrontMatter {
  articleId: string;             // References original article
  articleSlug?: string;          // Omnivore slug (preferred filename key)
  articleUrl: string;            // Source article URL
  articleTitle: string;          // Source article title
  savedAt: string;               // When article was saved to Omnivore
  analyzedAt: string;            // ISO timestamp of analysis

  topics: string[];              // Extracted topics
  topicScores: Record<string, number>; // Topic confidence scores
  sentiment: 'positive' | 'neutral' | 'negative';
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

/**
 * Front-matter metadata for generated content
 * Saved in content/generated/blog-posts/ or content/generated/newsletters/
 */
export interface GeneratedContentFrontMatter {
  title: string;                 // SEO-optimized title
  metaDescription: string;       // SEO meta description (155 chars)
  generatedAt: string;           // ISO timestamp of generation
  type: 'blog-post' | 'newsletter';
  sources: string[];             // Source article URLs
  topics: string[];              // Main topics covered
  publishedAt?: string;          // ISO timestamp if published
  slug?: string;                 // URL-friendly slug
}

/**
 * Complete stored article with content
 * Result of reading an article Markdown file
 */
export interface StoredArticle {
  frontMatter: ArticleFrontMatter;
  content: string;               // Markdown content
  highlights?: Array<{
    quote: string;
    annotation?: string;
  }>;
}

/**
 * Complete stored analysis with details
 * Result of reading an analysis Markdown file
 */
export interface StoredAnalysis {
  frontMatter: AnalysisFrontMatter;
  summary: string;               // 2-3 sentence summary
  keyPoints: string[];           // 3-5 key takeaways
  monetizationAngle: string;     // How to turn into content
}

/**
 * Complete generated content
 * Result of reading a generated Markdown file
 */
export interface StoredGeneratedContent {
  frontMatter: GeneratedContentFrontMatter;
  content: string;               // Full Markdown content
}

/**
 * Search index entry
 * Stored in content/.metadata/index.json
 */
export interface SearchIndexEntry {
  id: string;
  slug: string;
  title: string;
  topics: string[];
  labels: string[];
  savedAt: string;
  analyzed: boolean;
}
