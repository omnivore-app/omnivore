#!/usr/bin/env tsx
// AIDEV-NOTE: agent-helper - fetches article content for agent analysis
// AIDEV-NOTE: omnivore-boundary - GraphQL API only

import { getArticle } from '../lib/omnivore/client.js';
import 'dotenv/config';

async function main() {
  const articleSlug = process.argv[2];
  const username = process.argv[3];

  if (!articleSlug || !username) {
    console.error('Usage: tsx cli/get-article-content.ts <articleSlug> <username>');
    process.exit(1);
  }

  try {
    const result = await getArticle(articleSlug, username);

    if (!result?.article?.content) {
      console.error('No content found');
      process.exit(1);
    }

    // Output ONLY content to stdout (no JSON wrapper)
    console.log(result.article.content);
  } catch (err: any) {
    console.error(`Error fetching article: ${err.message}`);
    process.exit(1);
  }
}

main();
