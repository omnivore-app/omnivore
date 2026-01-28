#!/bin/bash
# Test API authentication

echo "Testing API endpoint: $API_ENDPOINT"
echo "Using API key: ${OMNIVORE_API_KEY:0:10}..."
echo ""

# Test with curl
echo "Testing GraphQL endpoint..."
curl -v "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Omnivore-Authorization: $OMNIVORE_API_KEY" \
  -d '{"query":"query { me { id name email } }"}' \
  2>&1 | head -50

echo ""
echo "---"
echo "If you see HTML instead of JSON, check:"
echo "1. API_ENDPOINT is correct (should end with /api/graphql)"
echo "2. OMNIVORE_API_KEY is set correctly"
echo "3. The API service is running"
