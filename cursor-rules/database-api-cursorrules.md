# Database and API - Cursor Rules

## Database Patterns

- Use migrations for all schema changes
- Place migrations in `packages/db/migrations/`
- Use descriptive migration names with timestamps
- Always include both up and down migrations
- Use proper indexing for performance
- Implement soft deletes where appropriate
- Use database transactions for complex operations

## Database Models

- Use proper relationships
- Implement proper validations
- Use descriptive field names
- Implement proper indexes
- Use proper data types
- Handle cascading properly

## PostgreSQL Specific

- Use vector extensions for search functionality
- Implement proper connection pooling
- Use prepared statements for security
- Optimize queries with proper indexing
- Use database-specific features appropriately

## Redis Patterns

- Use Redis for caching and queues
- Implement proper cache invalidation strategies
- Use appropriate data structures (strings, hashes, sets, etc.)
- Set proper TTL values for cached data
- Handle Redis connection failures gracefully

## Data Consistency

- Implement proper ACID transactions where needed
- Use proper isolation levels
- Handle concurrent access appropriately
- Implement proper data validation
- Use database constraints effectively
