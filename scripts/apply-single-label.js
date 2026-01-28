#!/usr/bin/env node

import fetch from 'node-fetch';
import chalk from 'chalk';

const CONFIG = {
  API_URL:
    process.env.API_ENDPOINT ||
    process.env.API_URL ||
    'http://localhost:4000/api/graphql',
  API_KEY: process.env.OMNIVORE_API_KEY,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[name] = value;
  }
  return args;
}

const args = parseArgs(process.argv);
const pageId = args.pageId || process.env.PAGE_ID;
const labelName = args.label || process.env.LABEL_NAME;

if (!CONFIG.API_KEY) {
  console.error(chalk.red('❌ OMNIVORE_API_KEY environment variable is required'));
  console.error(
    chalk.gray(
      'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/apply-single-label.js --pageId <uuid> --label <name>',
    ),
  );
  process.exit(1);
}

if (!pageId || !labelName) {
  console.error(chalk.red('❌ Missing required args'));
  console.error(
    chalk.gray(
      'Usage: node scripts/apply-single-label.js --pageId <uuid> --label <name>',
    ),
  );
  process.exit(1);
}

// Make GraphQL request
async function makeGraphQLRequest(query, variables = {}) {
  const response = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Omnivore-Authorization': CONFIG.API_KEY,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

// Get labels to find artifact label ID
async function fetchLabels() {
  const query = `
    query {
      labels {
        ... on LabelsSuccess {
          labels {
            id
            name
            color
          }
        }
        ... on LabelsError {
          errorCodes
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(query);

  if (data.labels.errorCodes) {
    throw new Error(`Failed to fetch labels: ${data.labels.errorCodes.join(', ')}`);
  }

  return data.labels.labels;
}

// Apply labels to an item using setLabels mutation
async function applyLabel(pageId, labelId, labelName) {
  const mutation = `
    mutation SetLabels($input: SetLabelsInput!) {
      setLabels(input: $input) {
        ... on SetLabelsSuccess {
          labels {
            id
            name
          }
        }
        ... on SetLabelsError {
          errorCodes
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(mutation, {
    input: {
      pageId: pageId,
      labelIds: [labelId],
    },
  });

  if (data.setLabels.errorCodes) {
    throw new Error(`Failed to set labels: ${data.setLabels.errorCodes.join(', ')}`);
  }

  console.log(chalk.green(`✓ Applied label "${labelName}"`));
  return data.setLabels.labels;
}

async function main() {
  try {
    console.log(
      chalk.blue(`🏷️  Applying label "${labelName}" to page ${pageId}`),
    );

    // Fetch labels to find artifact label ID
    const labels = await fetchLabels();
    const targetLabel = labels.find(l => l.name === labelName);

    if (!targetLabel) {
      throw new Error(`Label not found: ${labelName}`);
    }

    console.log(chalk.gray(`Found label: ${targetLabel.id}`));

    await applyLabel(pageId, targetLabel.id, labelName);

    console.log(chalk.bold.green('✅ Label applied successfully!'));

  } catch (error) {
    console.error(chalk.red('❌ Failed to apply label:'), error.message);
    process.exit(1);
  }
}

main();
