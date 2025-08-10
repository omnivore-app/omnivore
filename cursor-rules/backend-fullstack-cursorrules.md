# Backend and Full-Stack - Cursor Rules

## GraphQL API Patterns

- Follow GraphQL best practices with proper schema design
- Use GraphQL Code Generator for type generation
- Implement proper error handling with GraphQL error types
- Use DataLoader pattern for N+1 query prevention
- Implement proper authentication and authorization
- Use subscriptions for real-time features
- Follow relay-style pagination for lists

## API Design

- Follow RESTful principles for REST endpoints
- Use proper HTTP status codes
- Implement proper versioning
- Use consistent error response formats
- Implement proper pagination
- Use proper HTTP methods
- Document all APIs

## API Handlers

- Implement proper error handling
- Use proper HTTP status codes
- Validate input parameters
- Implement proper logging
- Use proper middleware patterns
- Handle edge cases gracefully

## GraphQL Schema Files

- Use descriptive field names
- Implement proper type relationships
- Use unions for polymorphic types
- Document schema with descriptions
- Follow GraphQL naming conventions

## Content Processing

- Implement proper content extraction
- Use readability algorithms for article parsing
- Handle different content types (PDF, articles, etc.)
- Implement proper error handling for content fetching
- Use queues for background processing
- Implement retry mechanisms

## Microservices Architecture

- Each service should be in its own package under `packages/` or `pkg/`
- Shared utilities should be in `packages/utils`
- Use proper inter-service communication patterns
- Implement proper service discovery
- Handle service failures gracefully
