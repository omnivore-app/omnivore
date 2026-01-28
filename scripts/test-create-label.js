#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL =
  process.env.API_ENDPOINT ||
  process.env.API_URL ||
  'http://localhost:4000/api/graphql';
const API_KEY = process.env.OMNIVORE_API_KEY;

if (!API_KEY) {
  console.error('❌ OMNIVORE_API_KEY environment variable is required');
  console.error(
    'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/test-create-label.js',
  );
  process.exit(1);
}

async function testCreateLabel() {
  console.log('Testing label creation with API key...');

  const mutation = `
    mutation CreateLabel($input: CreateLabelInput!) {
      createLabel(input: $input) {
        ... on CreateLabelSuccess {
          label {
            id
            name
            color
          }
        }
        ... on CreateLabelError {
          errorCodes
        }
      }
    }
  `;

  const variables = {
    input: {
      name: 'test-migration-label',
      color: '#FF0000',
      description: 'Test label created by migration script'
    }
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Omnivore-Authorization': API_KEY,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    console.log('Response status:', response.status);

    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCreateLabel();
