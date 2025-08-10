# Testing - Cursor Rules

## Testing Standards

- Write unit tests for all business logic
- Use integration tests for API endpoints
- Implement E2E tests for critical user flows
- Use proper mocking for external dependencies
- Maintain test coverage above 80%
- Use descriptive test names and organize in suites

## Jest Configuration (Preferred)

- Use Jest for unit and integration testing
- Configure with TypeScript support
- Use proper setup and teardown procedures
- Implement proper test isolation
- Use Jest's built-in mocking capabilities

## Mocha/Chai (Legacy - Gradually Phase Out)

- Existing tests may use Mocha and Chai
- When refactoring, prefer migrating to Jest
- Maintain existing test functionality during migration
- Use consistent assertion styles

## Testing Patterns

- Test business logic independently of framework code
- Use proper test doubles (mocks, stubs, spies)
- Test error conditions and edge cases
- Implement proper async testing patterns
- Use property-based testing where appropriate

## Test Organization

- Place tests adjacent to source code or in dedicated test directories
- Use consistent naming conventions (_.test.ts, _.spec.ts)
- Group related tests in describe blocks
- Use proper test lifecycle hooks (beforeEach, afterEach)
- Keep tests focused and independent

## End-to-End Testing

- Use Cypress for E2E testing
- Test critical user journeys
- Use proper page object patterns
- Implement proper test data management
- Handle async operations appropriately
