#!/usr/bin/env node

/**
 * Omnivore API Client
 * GraphQL client for interacting with Omnivore API
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

const API_URL = process.env.OMNIVORE_API_URL || 'https://api-prod.omnivore.app/api/graphql';
const API_KEY = process.env.OMNIVORE_API_KEY;

if (!API_KEY) {
  console.error('❌ OMNIVORE_API_KEY not set in environment');
  process.exit(1);
}

/**
 * Execute GraphQL query against Omnivore API
 */
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Omnivore self-hosted commonly expects `Omnivore-Authorization`, while some deployments accept `Authorization`.
        // Sending both keeps the CLI compatible across environments.
        'Authorization': API_KEY,
        'Omnivore-Authorization': API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL Request Error:', error.message);
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export async function getMe() {
  const query = `
    query {
      me {
        id
        name
        email
        profile {
          username
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.me;
}

/**
 * Search articles with filters
 */
export async function searchArticles({
  query = 'in:all',
  first = 10,
  after = '',
  includeContent = false,
} = {}) {
  const searchQuery = `
    query Search($query: String!, $first: Int, $after: String, $includeContent: Boolean) {
      search(query: $query, first: $first, after: $after, includeContent: $includeContent) {
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
              slug
              title
              url
              originalArticleUrl
              createdAt
              updatedAt
              publishedAt
              savedAt
              author
              description
              image
              siteName
              pageType
              wordsCount
              readingProgressTopPercent
              isArchived
              folder
              content
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

  const data = await graphqlRequest(searchQuery, { query, first, after, includeContent });

  if (data.search.errorCodes) {
    throw new Error(`Search Error: ${data.search.errorCodes.join(', ')}`);
  }

  return data.search;
}

/**
 * Get article by ID
 */
export async function getArticle(slug, username) {
  const query = `
    query GetArticle($slug: String!, $username: String!) {
      article(slug: $slug, username: $username) {
        ... on ArticleSuccess {
          article {
            id
            title
            url
            content
            author
            description
            publishedAt
            updatedAt
            createdAt
            savedAt
            highlights(input: {}) {
              id
              quote
              annotation
            }
            labels {
              id
              name
              color
            }
          }
        }
        ... on ArticleError {
          errorCodes
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { slug, username });
  return data.article;
}

/**
 * Get articles saved in a time range
 */
export async function getArticlesByDate({
  startDate,
  endDate,
  first = 100,
} = {}) {
  const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const end = endDate || new Date().toISOString();

  const query = `saved:>${start.split('T')[0]} saved:<${end.split('T')[0]} sort:saved-desc`;

  return await searchArticles({ query, first, includeContent: false });
}

/**
 * Get articles with specific labels
 */
export async function getArticlesByLabel(labelName, first = 50) {
  const query = `label:${labelName} sort:saved-desc`;
  return await searchArticles({ query, first });
}

/**
 * Get recently saved articles
 */
export async function getRecentArticles(hours = 24, first = 50) {
  let query;

  if (hours <= 24) {
    query = 'saved:last24hrs';
  } else if (hours <= 168) {
    query = 'saved:last7days';
  } else {
    const days = Math.ceil(hours / 24);
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    query = `saved:>${date}`;
  }

  query += ' sort:saved-desc';
  return await searchArticles({ query, first, includeContent: false });
}

/**
 * Get articles by topic/keyword
 */
export async function searchByTopic(topic, first = 50) {
  const query = `${topic} sort:saved-desc`;
  return await searchArticles({ query, first, includeContent: false });
}

/**
 * Get unread articles
 */
export async function getUnreadArticles(first = 50) {
  const query = 'in:inbox is:unread sort:saved-desc';
  return await searchArticles({ query, first });
}

/**
 * Get all labels
 */
export async function getLabels() {
  const query = `
    query {
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

  const data = await graphqlRequest(query);

  if (data.labels.errorCodes) {
    throw new Error(`Labels Error: ${data.labels.errorCodes.join(', ')}`);
  }

  return data.labels.labels;
}

/**
 * Get highlights for an article
 */
export async function getHighlights(slug, username) {
  const query = `
    query GetHighlights($slug: String!, $username: String!) {
      article(slug: $slug, username: $username) {
        ... on ArticleSuccess {
          article {
            highlights {
              id
              quote
              annotation
              createdAt
              updatedAt
              type
            }
          }
        }
        ... on ArticleError {
          errorCodes
        }
      }
    }
  `;

  const data = await graphqlRequest(query, { slug, username });
  return data.article?.article?.highlights || [];
}

/**
 * Update article/page metadata
 */
export async function updatePage({ pageId, description, title, byline, publishedAt, savedAt }) {
  const mutation = `
    mutation UpdatePage($input: UpdatePageInput!) {
      updatePage(input: $input) {
        ... on UpdatePageSuccess {
          updatedPage {
            id
            title
            description
            author
          }
        }
        ... on UpdatePageError {
          errorCodes
        }
      }
    }
  `;

  const input = { pageId };
  if (description !== undefined) input.description = description;
  if (title !== undefined) input.title = title;
  if (byline !== undefined) input.byline = byline;
  if (publishedAt !== undefined) input.publishedAt = publishedAt;
  if (savedAt !== undefined) input.savedAt = savedAt;

  const data = await graphqlRequest(mutation, { input });
  return data.updatePage;
}

/**
 * Create a label.
 */
export async function createLabel({ name, color, description }) {
  const mutation = `
    mutation CreateLabel($input: CreateLabelInput!) {
      createLabel(input: $input) {
        ... on CreateLabelSuccess {
          label {
            id
            name
            color
            description
            createdAt
          }
        }
        ... on CreateLabelError {
          errorCodes
        }
      }
    }
  `;

  const input = { name };
  if (color !== undefined) input.color = color;
  if (description !== undefined) input.description = description;

  const data = await graphqlRequest(mutation, { input });
  return data.createLabel;
}

/**
 * Set labels for a page (replaces existing labels).
 * Use either `labelIds` or `labels` (CreateLabelInput[]). If `labels` is used, Omnivore may create missing labels.
 */
export async function setLabels({ pageId, labelIds, labels, source }) {
  const mutation = `
    mutation SetLabels($input: SetLabelsInput!) {
      setLabels(input: $input) {
        ... on SetLabelsSuccess {
          labels {
            id
            name
            color
          }
        }
        ... on SetLabelsError {
          errorCodes
        }
      }
    }
  `;

  const input = { pageId };
  if (labelIds !== undefined) input.labelIds = labelIds;
  if (labels !== undefined) input.labels = labels;
  if (source !== undefined) input.source = source;

  const data = await graphqlRequest(mutation, { input });
  return data.setLabels;
}

/**
 * Save a URL into Omnivore (creates a new library item / saving request).
 */
export async function saveUrl({ url, source, folder, savedAt, publishedAt, labels, timezone, locale, state, clientRequestId }) {
  const mutation = `
    mutation SaveUrl($input: SaveUrlInput!) {
      saveUrl(input: $input) {
        ... on SaveSuccess {
          url
          clientRequestId
        }
        ... on SaveError {
          errorCodes
        }
      }
    }
  `;

  const input = { url, source, clientRequestId };
  if (folder !== undefined) input.folder = folder;
  if (savedAt !== undefined) input.savedAt = savedAt;
  if (publishedAt !== undefined) input.publishedAt = publishedAt;
  if (labels !== undefined) input.labels = labels;
  if (timezone !== undefined) input.timezone = timezone;
  if (locale !== undefined) input.locale = locale;
  if (state !== undefined) input.state = state;

  const data = await graphqlRequest(mutation, { input });
  return data.saveUrl;
}

/**
 * Create highlight with annotation (or standalone NOTE)
 */
export async function createHighlight({ id, shortId, articleId, quote = '', annotation, patch = '', prefix = '', suffix = '', color = '#FFD700', type = 'HIGHLIGHT' }) {
  const mutation = `
    mutation CreateHighlight($input: CreateHighlightInput!) {
      createHighlight(input: $input) {
        ... on CreateHighlightSuccess {
          highlight {
            id
            quote
            annotation
            color
            type
            createdAt
          }
        }
        ... on CreateHighlightError {
          errorCodes
        }
      }
    }
  `;

  const input = {
    id,
    shortId,
    articleId,
    patch,
    prefix,
    suffix,
    color,
    type
  };

  if (quote) input.quote = quote;
  if (annotation) input.annotation = annotation;

  const data = await graphqlRequest(mutation, { input });
  return data.createHighlight;
}

/**
 * Update highlight/note annotation
 */
export async function updateHighlight({ highlightId, annotation, quote, html, color }) {
  const mutation = `
    mutation UpdateHighlight($input: UpdateHighlightInput!) {
      updateHighlight(input: $input) {
        ... on UpdateHighlightSuccess {
          highlight {
            id
            annotation
            updatedAt
          }
        }
        ... on UpdateHighlightError {
          errorCodes
        }
      }
    }
  `;

  const input = { highlightId };
  if (annotation !== undefined) input.annotation = annotation;
  if (quote !== undefined) input.quote = quote;
  if (html !== undefined) input.html = html;
  if (color !== undefined) input.color = color;

  const data = await graphqlRequest(mutation, { input });
  return data.updateHighlight;
}

/**
 * Delete highlight/note
 */
export async function deleteHighlight(highlightId) {
  const mutation = `
    mutation DeleteHighlight($highlightId: ID!) {
      deleteHighlight(highlightId: $highlightId) {
        ... on DeleteHighlightSuccess {
          highlight {
            id
          }
        }
        ... on DeleteHighlightError {
          errorCodes
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, { highlightId });
  return data.deleteHighlight;
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    const user = await getMe();
    console.log('✅ Connected to Omnivore API');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Username: ${user.profile.username}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Omnivore API');
    console.error(`   ${error.message}`);
    return false;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    await testConnection();
  } else if (args.includes('--recent')) {
    const hours = parseInt(args[args.indexOf('--recent') + 1]) || 24;
    const result = await getRecentArticles(hours);
    console.log(`Found ${result.pageInfo.totalCount} articles from last ${hours} hours`);
    result.edges.forEach(({ node }) => {
      console.log(`  - ${node.title}`);
      console.log(`    ${node.url}`);
      console.log(`    Saved: ${node.savedAt}`);
    });
  } else {
    console.log('Usage:');
    console.log('  node client.js --test              # Test API connection');
    console.log('  node client.js --recent [hours]    # Get recent articles');
  }
}

export default {
  graphqlRequest,
  getMe,
  searchArticles,
  getArticle,
  getArticlesByDate,
  getArticlesByLabel,
  getRecentArticles,
  searchByTopic,
  getUnreadArticles,
  getLabels,
  getHighlights,
  testConnection,
};
