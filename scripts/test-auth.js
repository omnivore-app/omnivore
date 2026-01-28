#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL =
  process.env.API_ENDPOINT ||
  process.env.API_URL ||
  'http://localhost:4000/api/graphql';
const API_KEY = process.env.OMNIVORE_API_KEY;

if (!API_KEY) {
  console.error('❌ OMNIVORE_API_KEY environment variable is required');
  console.error('Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/test-auth.js');
  process.exit(1);
}

async function testAuth() {
  console.log('Testing API authentication...');
  console.log('API URL:', API_URL);
  console.log('API Key:', `${API_KEY.substring(0, 8)}...`);

  const query = `
    query {
      me {
        id
        name
        email
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Omnivore-Authorization': API_KEY,
      },
      body: JSON.stringify({ query }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();
