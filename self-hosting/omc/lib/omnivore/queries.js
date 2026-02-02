/**
 * Pre-built GraphQL Queries for Omnivore API
 * Collection of common query patterns for content analysis
 */

/**
 * Search query with all fields needed for content analysis
 */
export const SEARCH_ARTICLES_FULL = `
  query SearchArticlesFull($query: String!, $first: Int, $after: String) {
    search(query: $query, first: $first, after: $after, includeContent: false) {
      ... on SearchSuccess {
        pageInfo {
          totalCount
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            url
            originalArticleUrl
            slug
            createdAt
            updatedAt
            publishedAt
            savedAt
            author
            description
            image
            siteName
            pageType
            wordCount
            readingProgressTopPercent
            readingProgressBottomPercent
            isArchived
            folder
            labels {
              id
              name
              color
            }
            highlights {
              id
              quote
              annotation
              createdAt
            }
          }
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
`;

/**
 * Get article with full content
 */
export const GET_ARTICLE_FULL = `
  query GetArticleFull($slug: String!, $username: String!) {
    article(slug: $slug, username: $username) {
      ... on ArticleSuccess {
        article {
          id
          title
          url
          slug
          content
          author
          description
          image
          publishedAt
          createdAt
          savedAt
          updatedAt
          wordCount
          siteName
          originalArticleUrl
          highlights {
            id
            quote
            annotation
            createdAt
          }
          labels {
            id
            name
            color
            description
          }
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
`;

/**
 * Get user profile
 */
export const GET_USER_PROFILE = `
  query GetUserProfile {
    me {
      id
      name
      email
      profile {
        username
        pictureUrl
        bio
      }
    }
  }
`;

/**
 * Get all labels
 */
export const GET_LABELS = `
  query GetLabels {
    labels {
      ... on LabelsSuccess {
        labels {
          id
          name
          color
          description
          createdAt
        }
      }
      ... on LabelsError {
        errorCodes
      }
    }
  }
`;

/**
 * Search with content included (for analysis)
 */
export const SEARCH_WITH_CONTENT = `
  query SearchWithContent($query: String!, $first: Int, $after: String) {
    search(query: $query, first: $first, after: $after, includeContent: true) {
      ... on SearchSuccess {
        pageInfo {
          totalCount
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            title
            url
            content
            author
            description
            publishedAt
            savedAt
            siteName
            labels {
              name
            }
            highlights {
              quote
              annotation
            }
          }
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
`;

/**
 * Common search query patterns
 */
export const QUERY_PATTERNS = {
  // Time-based
  LAST_24_HOURS: 'saved:last24hrs sort:saved-desc',
  LAST_7_DAYS: 'saved:last7days sort:saved-desc',
  LAST_30_DAYS: 'saved:last30days sort:saved-desc',

  // Status-based
  INBOX: 'in:inbox sort:saved-desc',
  ARCHIVED: 'in:archive sort:saved-desc',
  UNREAD: 'is:unread sort:saved-desc',
  READ: 'is:read sort:saved-desc',

  // Type-based
  ARTICLES: 'type:article sort:saved-desc',
  HIGHLIGHTS: 'type:highlights sort:saved-desc',

  // Content-based
  WITH_HIGHLIGHTS: 'has:highlights sort:saved-desc',
  WITH_LABELS: 'has:labels sort:saved-desc',
  NO_LABELS: 'no:label sort:saved-desc',

  // Topic-based (AI/Tech)
  AI_ML: '(ai OR "machine learning" OR llm OR "language model") sort:saved-desc',
  DEVOPS: '(devops OR kubernetes OR docker OR "cloud native") sort:saved-desc',
  DATABASES: '(database OR postgres OR mongodb OR redis) sort:saved-desc',
  PROGRAMMING: '(programming OR coding OR "software engineering") sort:saved-desc',
  STARTUPS: '(startup OR founder OR "venture capital" OR product) sort:saved-desc',

  // Combined patterns
  RECENT_AI: 'saved:last7days (ai OR llm OR "machine learning") sort:saved-desc',
  RECENT_TECH: 'saved:last7days (programming OR devops OR database) sort:saved-desc',
  UNREAD_ARTICLES: 'in:inbox is:unread type:article sort:saved-desc',
};

/**
 * Build date range query
 */
export function buildDateRangeQuery(startDate, endDate, sortBy = 'saved-desc') {
  const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
  const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];

  return `saved:>${start} saved:<${end} sort:${sortBy}`;
}

/**
 * Build label query
 */
export function buildLabelQuery(labels, operator = 'OR') {
  if (Array.isArray(labels)) {
    return labels.map(l => `label:${l}`).join(` ${operator} `);
  }
  return `label:${labels}`;
}

/**
 * Build keyword query
 */
export function buildKeywordQuery(keywords, operator = 'OR') {
  if (Array.isArray(keywords)) {
    const quoted = keywords.map(k => `"${k}"`);
    return `(${quoted.join(` ${operator} `)})`;
  }
  return `"${keywords}"`;
}

/**
 * Build complex query
 */
export function buildComplexQuery({
  keywords = [],
  labels = [],
  timeRange = 'last7days',
  status = null,
  hasHighlights = null,
  sortBy = 'saved-desc',
} = {}) {
  const parts = [];

  // Time range
  if (timeRange === 'last24hrs' || timeRange === 'last7days' || timeRange === 'last30days') {
    parts.push(`saved:${timeRange}`);
  } else if (timeRange.includes('>') || timeRange.includes('<')) {
    parts.push(timeRange);
  }

  // Keywords
  if (keywords.length > 0) {
    parts.push(buildKeywordQuery(keywords));
  }

  // Labels
  if (labels.length > 0) {
    parts.push(buildLabelQuery(labels));
  }

  // Status
  if (status) {
    if (status === 'inbox') parts.push('in:inbox');
    else if (status === 'archived') parts.push('in:archive');
    else if (status === 'unread') parts.push('is:unread');
    else if (status === 'read') parts.push('is:read');
  }

  // Highlights
  if (hasHighlights === true) parts.push('has:highlights');
  else if (hasHighlights === false) parts.push('no:highlights');

  // Sort
  if (sortBy) parts.push(`sort:${sortBy}`);

  return parts.join(' ');
}

/**
 * Topic-based query builders
 */
export const TOPIC_QUERIES = {
  ai: {
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'language model', 'gpt', 'claude', 'neural network'],
    description: 'AI and Machine Learning',
  },
  devops: {
    keywords: ['devops', 'kubernetes', 'docker', 'ci/cd', 'cloud native', 'infrastructure', 'terraform'],
    description: 'DevOps and Infrastructure',
  },
  programming: {
    keywords: ['programming', 'coding', 'software engineering', 'algorithm', 'data structure', 'clean code'],
    description: 'Programming and Software Engineering',
  },
  databases: {
    keywords: ['database', 'sql', 'nosql', 'postgres', 'mongodb', 'redis', 'query optimization'],
    description: 'Databases and Data Engineering',
  },
  web: {
    keywords: ['web development', 'javascript', 'typescript', 'react', 'vue', 'frontend', 'backend'],
    description: 'Web Development',
  },
  cloud: {
    keywords: ['aws', 'azure', 'gcp', 'cloud computing', 'serverless', 'lambda'],
    description: 'Cloud Computing',
  },
  startup: {
    keywords: ['startup', 'founder', 'entrepreneurship', 'venture capital', 'product market fit', 'growth'],
    description: 'Startups and Business',
  },
  security: {
    keywords: ['security', 'cybersecurity', 'authentication', 'encryption', 'vulnerability'],
    description: 'Security',
  },
};

/**
 * Build query for specific topic
 */
export function buildTopicQuery(topicKey, timeRange = 'last7days') {
  const topic = TOPIC_QUERIES[topicKey];
  if (!topic) {
    throw new Error(`Unknown topic: ${topicKey}`);
  }

  return buildComplexQuery({
    keywords: topic.keywords,
    timeRange,
    sortBy: 'saved-desc',
  });
}

export default {
  SEARCH_ARTICLES_FULL,
  GET_ARTICLE_FULL,
  GET_USER_PROFILE,
  GET_LABELS,
  SEARCH_WITH_CONTENT,
  QUERY_PATTERNS,
  buildDateRangeQuery,
  buildLabelQuery,
  buildKeywordQuery,
  buildComplexQuery,
  buildTopicQuery,
  TOPIC_QUERIES,
};
