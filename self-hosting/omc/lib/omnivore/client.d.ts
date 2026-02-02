export interface OmnivoreHighlight {
  id: string;
  quote: string;
  annotation?: string | null;
  createdAt: string;
  updatedAt?: string;
  type?: string;
}

export interface OmnivoreLabel {
  id: string;
  name: string;
  color: string;
}

export interface OmnivoreArticle {
  id: string;
  title: string;
  url: string;
  content?: string | null;
  description?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  slug?: string;
  wordCount?: number;
  createdAt: string;
  savedAt: string;
  updatedAt: string;
  isArchived?: boolean;
  folder?: string;
  labels: OmnivoreLabel[];
  highlights: OmnivoreHighlight[];
}

export interface GetMeResult {
  id: string;
  name?: string;
  email?: string;
  profile?: { username?: string };
}

export interface GetArticleResult {
  article?: OmnivoreArticle;
  errorCodes?: string[];
}

export function getMe(): Promise<GetMeResult>;
export function searchArticles(args?: Record<string, unknown>): Promise<any>;
export function getArticle(slug: string, username: string): Promise<GetArticleResult>;
export function getArticlesByDate(args?: Record<string, unknown>): Promise<any>;
export function getArticlesByLabel(labelName: string, first?: number): Promise<any>;
export function getRecentArticles(hours?: number, first?: number): Promise<any>;
export function searchByTopic(topic: string, first?: number): Promise<any>;
export function getUnreadArticles(first?: number): Promise<any>;
export function getLabels(): Promise<any>;
export function getHighlights(slug: string, username: string): Promise<any[]>;

export function updatePage(args: {
  pageId: string;
  description?: string;
  title?: string;
  byline?: string;
  publishedAt?: string;
  savedAt?: string;
}): Promise<any>;

export function createLabel(args: {
  name: string;
  color?: string;
  description?: string;
}): Promise<any>;

export function setLabels(args: {
  pageId: string;
  labelIds?: string[];
  labels?: Array<{ name: string; color?: string; description?: string }>;
  source?: string;
}): Promise<any>;

export function saveUrl(args: {
  url: string;
  source: string;
  clientRequestId: string;
  folder?: string;
  savedAt?: string;
  publishedAt?: string;
  labels?: Array<{ name: string; color?: string; description?: string }>;
  timezone?: string;
  locale?: string;
  state?: string;
}): Promise<any>;

export function createHighlight(args: Record<string, unknown>): Promise<any>;
export function updateHighlight(args: Record<string, unknown>): Promise<any>;
export function deleteHighlight(highlightId: string): Promise<any>;
export function testConnection(): Promise<boolean>;
