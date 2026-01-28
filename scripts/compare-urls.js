#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  API_URL:
    process.env.API_ENDPOINT ||
    process.env.API_URL ||
    'http://localhost:4000/api/graphql',
  API_KEY: process.env.OMNIVORE_API_KEY,
  CSV_PATH: join(process.env.HOME, 'Downloads', 'part_000000.csv'),
  BATCH_SIZE: 100, // GraphQL pagination size
  OUTPUT_DIR: __dirname,
};

if (!CONFIG.API_KEY) {
  throw new Error('OMNIVORE_API_KEY environment variable is not set');
}

// GraphQL query to fetch all URLs
const FETCH_URLS_QUERY = `
  query FetchUrls($after: String, $first: Int) {
    search(
      query: "in:all sort:saved-desc"
      after: $after
      first: $first
    ) {
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
            createdAt
            updatedAt
          }
        }
      }
      ... on SearchError {
        errorCodes
      }
    }
  }
`;

// Fetch all URLs from Omnivore with pagination
async function fetchAllOmnivoreUrls() {
  const allUrls = [];
  let hasNextPage = true;
  let after = null;
  let pageCount = 0;

  console.log('🔍 Fetching all URLs from Omnivore...');

  while (hasNextPage) {
    pageCount++;
    console.log(`📄 Fetching page ${pageCount}...`);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Omnivore-Authorization': CONFIG.API_KEY,
        },
        body: JSON.stringify({
          query: FETCH_URLS_QUERY,
          variables: {
            after,
            first: CONFIG.BATCH_SIZE,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      const searchResult = result.data.search;

      if (searchResult.errorCodes) {
        throw new Error(`Search error: ${searchResult.errorCodes.join(', ')}`);
      }

      const items = searchResult.edges || [];
      console.log(`   Found ${items.length} items on page ${pageCount}`);

      // Extract URLs and metadata
      for (const edge of items) {
        const item = edge.node;
        allUrls.push({
          id: item.id,
          title: item.title,
          url: item.url,
          originalUrl: item.originalArticleUrl || item.url,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }

      hasNextPage = searchResult.pageInfo.hasNextPage;
      after = searchResult.pageInfo.endCursor;

      if (pageCount === 1) {
        console.log(`📊 Total items in Omnivore: ${searchResult.pageInfo.totalCount}`);
      }

      // Add delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error.message);
      throw error;
    }
  }

  console.log(`✅ Fetched ${allUrls.length} URLs from Omnivore`);
  return allUrls;
}

// Parse CSV file and extract URLs
function parseCSVUrls() {
  console.log('📋 Reading CSV file...');

  try {
    const csvContent = readFileSync(CONFIG.CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✅ Found ${records.length} items in CSV`);

    return records.map(record => ({
      title: record.title || 'No Title',
      url: record.resolved_url || record.given_url || record.url || '',
      givenUrl: record.given_url || '',
      resolvedUrl: record.resolved_url || '',
      timeAdded: record.time_added ? new Date(parseInt(record.time_added) * 1000).toISOString() : null,
      tags: record.tags || '',
    }));

  } catch (error) {
    console.error('❌ Error reading CSV file:', error.message);
    throw error;
  }
}

// Normalize URL for comparison (remove protocol, www, trailing slash, fragments)
function normalizeUrl(url) {
  if (!url) return '';

  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '') // Remove protocol
    .replace(/^www\./, '') // Remove www
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/#.*$/, '') // Remove fragments
    .replace(/\?.*$/, ''); // Remove query parameters (optional - comment out to keep params)
}

// Compare URLs
function compareUrls(omnivoreUrls, csvUrls) {
  console.log('🔍 Comparing URLs...');

  // Create normalized lookup sets
  const omnivoreNormalized = new Map();
  const csvNormalized = new Map();

  // Build Omnivore lookup
  for (const item of omnivoreUrls) {
    const normalized = normalizeUrl(item.url);
    const originalNormalized = normalizeUrl(item.originalUrl);

    if (normalized) {
      omnivoreNormalized.set(normalized, item);
    }
    if (originalNormalized && originalNormalized !== normalized) {
      omnivoreNormalized.set(originalNormalized, item);
    }
  }

  // Build CSV lookup
  for (const item of csvUrls) {
    const normalizedUrl = normalizeUrl(item.url);
    const normalizedGiven = normalizeUrl(item.givenUrl);
    const normalizedResolved = normalizeUrl(item.resolvedUrl);

    if (normalizedUrl) {
      csvNormalized.set(normalizedUrl, item);
    }
    if (normalizedGiven && normalizedGiven !== normalizedUrl) {
      csvNormalized.set(normalizedGiven, item);
    }
    if (normalizedResolved && normalizedResolved !== normalizedUrl && normalizedResolved !== normalizedGiven) {
      csvNormalized.set(normalizedResolved, item);
    }
  }

  // Find matches and differences
  const inBoth = [];
  const onlyInOmnivore = [];
  const onlyInCSV = [];

  // Check Omnivore items
  for (const [normalizedUrl, omnivoreItem] of omnivoreNormalized) {
    if (csvNormalized.has(normalizedUrl)) {
      inBoth.push({
        url: normalizedUrl,
        omnivore: omnivoreItem,
        csv: csvNormalized.get(normalizedUrl),
      });
    } else {
      onlyInOmnivore.push(omnivoreItem);
    }
  }

  // Check CSV items not in Omnivore
  for (const [normalizedUrl, csvItem] of csvNormalized) {
    if (!omnivoreNormalized.has(normalizedUrl)) {
      onlyInCSV.push(csvItem);
    }
  }

  return {
    inBoth,
    onlyInOmnivore,
    onlyInCSV,
    stats: {
      omnivoreTotal: omnivoreUrls.length,
      csvTotal: csvUrls.length,
      matches: inBoth.length,
      omnivoreOnly: onlyInOmnivore.length,
      csvOnly: onlyInCSV.length,
    },
  };
}

// Generate comparison report
function generateReport(comparison) {
  const { inBoth, onlyInOmnivore, onlyInCSV, stats } = comparison;

  console.log('\n📊 COMPARISON REPORT');
  console.log('==================');
  console.log(`📚 Total in Omnivore: ${stats.omnivoreTotal}`);
  console.log(`📋 Total in CSV: ${stats.csvTotal}`);
  console.log(`✅ URLs in both: ${stats.matches}`);
  console.log(`🔵 Only in Omnivore: ${stats.omnivoreOnly}`);
  console.log(`🔴 Only in CSV (missing from Omnivore): ${stats.csvOnly}`);
  console.log(`📈 Import success rate: ${((stats.matches / stats.csvTotal) * 100).toFixed(1)}%`);

  // Save detailed reports
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save URLs only in CSV (missing from Omnivore)
  if (onlyInCSV.length > 0) {
    const missingFile = join(CONFIG.OUTPUT_DIR, `missing-from-omnivore-${timestamp}.json`);
    writeFileSync(missingFile, JSON.stringify(onlyInCSV, null, 2));
    console.log(`\n💾 Saved ${onlyInCSV.length} missing URLs to: ${missingFile}`);

    // Save a simple list for easier processing
    const missingList = join(CONFIG.OUTPUT_DIR, `missing-urls-list-${timestamp}.txt`);
    const missingUrlsList = onlyInCSV.map(item => item.url).join('\n');
    writeFileSync(missingList, missingUrlsList);
    console.log(`💾 Saved missing URLs list to: ${missingList}`);
  }

  // Save full comparison report
  const reportFile = join(CONFIG.OUTPUT_DIR, `url-comparison-report-${timestamp}.json`);
  writeFileSync(reportFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    inBoth: inBoth.slice(0, 10), // First 10 matches as examples
    onlyInOmnivore: onlyInOmnivore.slice(0, 10), // First 10 examples
    onlyInCSV: onlyInCSV.slice(0, 100), // First 100 missing items
    fullStats: {
      totalMatches: inBoth.length,
      totalOmnivoreOnly: onlyInOmnivore.length,
      totalCSVOnly: onlyInCSV.length,
    },
  }, null, 2));
  console.log(`💾 Saved full comparison report to: ${reportFile}`);

  return comparison;
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting URL comparison...');

    if (!CONFIG.API_KEY) {
      throw new Error('OMNIVORE_API_KEY environment variable is not set');
    }

    // Fetch all URLs from both sources
    const [omnivoreUrls, csvUrls] = await Promise.all([
      fetchAllOmnivoreUrls(),
      Promise.resolve(parseCSVUrls()),
    ]);

    // Compare the URLs
    const comparison = compareUrls(omnivoreUrls, csvUrls);

    // Generate and save report
    generateReport(comparison);

    console.log('\n✅ Comparison complete!');

  } catch (error) {
    console.error('\n❌ Error during comparison:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
