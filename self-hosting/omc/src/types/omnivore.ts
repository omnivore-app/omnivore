/**
 * Omnivore API Type Definitions
 *
 * Types matching the GraphQL API responses from lib/omnivore/client.js
 * These interfaces represent the data structures returned by the Omnivore API.
 */

/**
 * Label attached to an article
 */
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

/**
 * Highlight/annotation made on an article
 */
export interface Highlight {
  id: string;
  quote: string;
  annotation?: string | null;
  createdAt: string;
}

/**
 * Article from Omnivore API
 * Matches the response structure from searchArticles() and getArticle()
 */
export interface OmnivoreArticle {
  id: string;
  title: string;
  url: string;
  originalArticleUrl?: string;
  slug?: string;
  content?: string | null;
  description?: string | null;
  author?: string | null;
  image?: string;
  siteName?: string;
  pageType?: string;
  wordCount?: number;
  createdAt: string;
  savedAt: string;
  publishedAt?: string | null;
  updatedAt: string;
  readingProgressTopPercent?: number;
  isArchived?: boolean;
  folder?: string;
  labels: Label[];
  highlights: Highlight[];
}

/**
 * Parameters for article search queries
 */
export interface SearchParams {
  query?: string;           // Omnivore query syntax (e.g., "label:ai", "in:inbox")
  first?: number;          // Number of results per page
  after?: string;          // Pagination cursor
  includeContent?: boolean; // Include full article content in response
}

/**
 * Pagination information
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount: number;
}

/**
 * Search result wrapper with pagination
 */
export interface SearchResult {
  edges: Array<{
    node: OmnivoreArticle;
  }>;
  pageInfo: PageInfo;
}

/**
 * User profile information
 */
export interface OmnivoreUser {
  id: string;
  name: string;
  email: string;
  profile: {
    username: string;
  };
}
