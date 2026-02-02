#!/usr/bin/env tsx

/**
 * Fetch and display notes for an article
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const API_URL = process.env.OMNIVORE_API_URL || 'https://api-prod.omnivore.app/api/graphql';
const API_KEY = process.env.OMNIVORE_API_KEY;

const articleId = process.argv[2] || '5977ff9f-01ea-4977-aa0e-1dbe43cd2a20';

console.log(`\n📝 Fetching notes for article: ${articleId}\n`);

const query = `
  query GetArticle($id: ID!) {
    article(id: $id) {
      ... on ArticleSuccess {
        article {
          id
          title
          highlights {
            id
            type
            quote
            annotation
            createdAt
            updatedAt
          }
        }
      }
      ... on ArticleError {
        errorCodes
      }
    }
  }
`;

const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': API_KEY,
  },
  body: JSON.stringify({ query, variables: { id: articleId } }),
});

const result = await response.json();

if (result.errors) {
  console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
  process.exit(1);
}

const article = result.data?.article?.article;

if (!article) {
  console.error('Article not found or error:', result.data?.article?.errorCodes);
  process.exit(1);
}

console.log(`Article: ${article.title}\n`);

const highlights = article.highlights || [];
const notes = highlights.filter((h: any) => h.type === 'NOTE');

console.log(`Found ${notes.length} notes:\n`);

for (const note of notes) {
  console.log('═'.repeat(80));
  console.log(`Note ID: ${note.id}`);
  console.log(`Type: ${note.type}`);
  console.log(`Created: ${note.createdAt}`);
  console.log(`Updated: ${note.updatedAt}`);
  console.log('─'.repeat(80));
  console.log('Annotation (raw Markdown):');
  console.log(note.annotation);
  console.log('═'.repeat(80));
  console.log();
}
