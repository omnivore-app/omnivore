/**
 * Content Analysis Type Definitions
 *
 * Types for AI-powered content analysis using Claude.
 * These represent the structured output from analysis prompts.
 */

/**
 * Complete content analysis result
 * Returned by ContentAnalyzer after analyzing an article
 */
export interface ContentAnalysis {
  articleId: string;             // Omnivore article ID
  topics: string[];              // 2-5 main topics (e.g., ["AI", "Machine Learning", "LLMs"])
  topicScores: Record<string, number>;  // Confidence scores 0-1 (e.g., { "AI": 0.95, "ML": 0.88 })
  summary: string;               // 2-3 sentence summary capturing main points
  keyPoints: string[];           // 3-5 key takeaways or actionable insights
  sentiment: 'positive' | 'neutral' | 'negative';  // Overall article tone
  monetizationAngle: string;     // How to package for audience (e.g., "Compare with 2 other LLM papers")

  // Content Planning (extracted from article only)
  contentType: string;              // Open-ended description (e.g., "tutorial", "comparison review", "announcement")
  problemStatement: string;         // Problem article addresses or "N/A"
  audienceLevel: string;            // "beginner"|"intermediate"|"advanced" or "N/A"

  // Knowledge Graph (for future corpus linking - from article only)
  technologiesMentioned: string[];  // Tools/frameworks/languages mentioned
  companiesMentioned: string[];     // Companies/organizations mentioned
  peopleMentioned: string[];        // Notable people mentioned (if relevant)
  conceptsExplained: string[];      // Key concepts/techniques explained
  relatedTechnologies: string[];    // Technologies compared to or built upon
  useCases: string[];               // Specific use cases or scenarios described

  // SEO Signals (from article only)
  targetKeywords: string[];         // Keywords emphasized in article or ["N/A"]
  searchQuestions: string[];        // Questions the article answers or ["N/A"]

  // Trend Signals (ONLY if present in article)
  githubRepo: string;               // GitHub URL or "N/A"
  releaseInfo: string;              // Version/release information or "N/A"

  analyzedAt: string;            // ISO timestamp of analysis
}

/**
 * Input to content analysis
 * Data sent to Claude for analysis
 */
export interface AnalysisRequest {
  title: string;
  author?: string;
  url: string;
  content: string;               // Full article text
  wordCount: number;
  highlights: Array<{            // User's highlights from Omnivore
    quote: string;
    annotation?: string;
  }>;
  publishedAt?: string;
}

/**
 * Topic with confidence score
 * Used for ranking and filtering topics
 */
export interface TopicScore {
  topic: string;                 // Topic name (e.g., "AI", "DevOps")
  score: number;                 // Confidence 0-1
  keywords: string[];            // Associated keywords found in content
}

/**
 * Analysis configuration
 * Options for customizing analysis behavior
 */
export interface AnalysisConfig {
  focusTopics?: string[];        // Prioritize these topics (from CLAUDE.md strategy)
  minTopicScore?: number;        // Minimum confidence threshold (default 0.7)
  maxTopics?: number;            // Maximum topics to extract (default 5)
  includeSentiment?: boolean;    // Whether to analyze sentiment (default true)
}

/**
 * Batch analysis result
 * Result of analyzing multiple articles together
 */
export interface BatchAnalysisResult {
  articles: Array<{
    articleId: string;
    analysis: ContentAnalysis;
  }>;
  commonTopics: string[];        // Topics appearing across multiple articles
  trends: Array<{                // Emerging trends detected
    topic: string;
    frequency: number;           // How many articles mention this
    averageScore: number;        // Average confidence across articles
  }>;
  analyzedAt: string;
}
