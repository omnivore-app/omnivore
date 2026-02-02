#!/usr/bin/env node

/**
 * Test script to verify which Omnivore API fields work
 * Tests baseline fields and extra fields individually
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

const OMNIVORE_API_URL = 'https://api-prod.omnivore.app/api/graphql';

// Get API key from environment
const API_KEY = process.env.OMNIVORE_API_KEY;

if (!API_KEY) {
  console.error('Error: OMNIVORE_API_KEY environment variable not set');
  process.exit(1);
}

// Baseline fields that work in client.js
const BASELINE_FIELDS = `
  id
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
`;

// Extra fields to test individually
const EXTRA_FIELDS = [
  'slug'
];

/**
 * Execute a GraphQL query against Omnivore API
 */
async function executeQuery(fields) {
  const query = `
    query Search($query: String!, $first: Int) {
      search(query: $query, first: $first) {
        ... on SearchSuccess {
          pageInfo {
            totalCount
            hasNextPage
          }
          edges {
            node {
              ${fields}
            }
          }
        }
        ... on SearchError {
          errorCodes
        }
      }
    }
  `;

  const variables = {
    query: 'in:all',
    first: 1
  };

  const requestBody = { query, variables };

  // Debug: Log what we're sending (only first time)
  if (!executeQuery.logged) {
    console.log('\n[DEBUG] Request body preview:');
    console.log('Query starts with:', query.substring(0, 100) + '...');
    console.log('Variables:', variables);
    executeQuery.logged = true;
  }

  const response = await fetch(OMNIVORE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Debug: Log what we're receiving (only first time)
  if (!executeQuery.receivedLog) {
    console.log('[DEBUG] Response preview:');
    console.log(JSON.stringify(data, null, 2).substring(0, 200) + '...\n');
    executeQuery.receivedLog = true;
  }

  return data;
}

/**
 * Test a specific field set
 */
async function testFields(name, fields) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`${'='.repeat(60)}`);

  try {
    const result = await executeQuery(fields);

    if (result.errors) {
      console.log('❌ FAILED');
      console.log('\nErrors:');
      result.errors.forEach(err => {
        console.log(`  - ${err.message}`);
        if (err.locations) {
          console.log(`    Location: line ${err.locations[0].line}, column ${err.locations[0].column}`);
        }
      });
      return false;
    } else if (result.data?.search?.errorCodes) {
      console.log('❌ SEARCH ERROR');
      console.log(`  Error codes: ${result.data.search.errorCodes.join(', ')}`);
      return false;
    } else if (result.data?.search?.edges?.[0]?.node) {
      console.log('✅ SUCCESS');
      console.log('\nSample data received:');
      const node = result.data.search.edges[0].node;
      // Show first 3 fields as sample
      const sampleKeys = Object.keys(node).slice(0, 3);
      sampleKeys.forEach(key => {
        const value = node[key];
        const display = typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value;
        console.log(`  ${key}: ${JSON.stringify(display)}`);
      });
      console.log(`  ... (${Object.keys(node).length} total fields)`);
      return true;
    } else {
      console.log('⚠️  UNEXPECTED RESPONSE');
      console.log(JSON.stringify(result, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ EXCEPTION');
    console.log(`  ${error.message}`);
    return false;
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('Omnivore API Field Compatibility Test');
  console.log(`API Endpoint: ${OMNIVORE_API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);

  const results = {
    baseline: null,
    extra: {}
  };

  // Test baseline fields
  results.baseline = await testFields('BASELINE FIELDS', BASELINE_FIELDS);

  // Test each extra field individually with baseline
  for (const field of EXTRA_FIELDS) {
    const combinedFields = BASELINE_FIELDS + '\n  ' + field;
    results.extra[field] = await testFields(
      `BASELINE + ${field}`,
      combinedFields
    );
  }

  // Summary report
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(60));

  console.log(`\nBaseline fields: ${results.baseline ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\nExtra fields:');
  for (const field of EXTRA_FIELDS) {
    const status = results.extra[field] ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${field}: ${status}`);
  }

  // Final verdict
  const allExtraPass = Object.values(results.extra).every(r => r === true);
  console.log('\n' + '='.repeat(60));
  if (results.baseline && allExtraPass) {
    console.log('✅ ALL TESTS PASSED - All fields are compatible');
  } else {
    console.log('❌ SOME TESTS FAILED - See details above');
  }
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
