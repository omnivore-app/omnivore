# Omnivore AI Agents Guidelines

This document outlines the expected behaviors, capabilities, and contribution patterns for AI agents working on the Omnivore codebase. It serves as a comprehensive guide for AI assistants, automated tools, and external agents contributing to the project.

## Table of Contents

- [Agent Types and Roles](#agent-types-and-roles)
- [Core Principles](#core-principles)
- [Development Guidelines](#development-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Security Considerations](#security-considerations)
- [Communication Protocols](#communication-protocols)
- [Contribution Workflow](#contribution-workflow)
- [Troubleshooting and Support](#troubleshooting-and-support)

## Agent Types and Roles

### Code Generation Agents

- **Primary Role**: Generate new code, components, and features
- **Responsibilities**:
  - Follow established patterns and architecture
  - Implement proper error handling and validation
  - Generate comprehensive tests alongside code
  - Ensure cross-platform compatibility considerations

### Code Review Agents

- **Primary Role**: Review pull requests and suggest improvements
- **Responsibilities**:
  - Verify adherence to coding standards
  - Check for security vulnerabilities
  - Validate test coverage
  - Ensure documentation completeness

### Refactoring Agents

- **Primary Role**: Improve existing code quality and structure
- **Responsibilities**:
  - Maintain backward compatibility
  - Preserve existing functionality
  - Update related documentation
  - Migrate tests appropriately

### Documentation Agents

- **Primary Role**: Create and maintain project documentation
- **Responsibilities**:
  - Keep documentation current with code changes
  - Ensure clarity and completeness
  - Maintain consistent formatting
  - Update API documentation automatically

## Core Principles

### 1. Truth and Accuracy Over Appeasement

- Pursue technical accuracy using first principles
- Provide honest assessments of code quality and architecture
- Suggest pragmatic solutions over popular ones
- Challenge assumptions when necessary

### 2. Elegance and Simplicity

- Favor simple, readable solutions over complex ones
- Prioritize maintainability and clarity
- Use appropriate abstractions without over-engineering
- Follow the principle of least surprise

### 3. Context Awareness

- Understand the monorepo structure and service interactions
- Consider impact across web, mobile, and browser extension clients
- Respect existing architectural decisions
- Maintain consistency with established patterns

### 4. Comprehensive Understanding

- Thoroughly analyze requirements before implementation
- Consider edge cases and error scenarios
- Understand the full scope of changes needed
- Trace dependencies and impacts across the codebase

## Development Guidelines

### Project Structure Awareness

```
omnivore/
├── packages/          # Core services and libraries
│   ├── api/          # GraphQL API backend
│   ├── web/          # Next.js frontend
│   ├── db/           # Database schemas and migrations
│   └── shared/       # Shared utilities
├── pkg/              # Additional packages
├── apple/            # iOS application
├── android/          # Android application
└── cursor-rules/     # AI development guidelines
```

### Technology Stack Considerations

- **Backend**: Node.js 22 (migrating to 23), TypeScript, GraphQL
- **Frontend**: Next.js, React, TypeScript, Stitches
- **Database**: PostgreSQL with vector extensions, Redis
- **Mobile**: Swift/SwiftUI (iOS), Kotlin/Compose (Android)
- **Testing**: Jest (preferred), Mocha/Chai (legacy - phase out)

### Architecture Patterns

- **Microservices**: Each service in separate package
- **GraphQL First**: Use GraphQL for API design
- **Type Safety**: Strict TypeScript throughout
- **Monorepo**: Lerna-managed workspace
- **Container-First**: Docker for all services

## Code Quality Standards

### TypeScript Requirements

```typescript
// ✅ Good: Proper typing with interfaces
interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: boolean
  readingSpeed: number
}

// ❌ Avoid: Using any type
function processData(data: any): any {
  return data
}

// ✅ Good: Use unknown and type guards
function processData(data: unknown): ProcessedData {
  if (isValidData(data)) {
    return transformData(data)
  }
  throw new Error('Invalid data format')
}
```

### Error Handling Patterns

```typescript
// ✅ GraphQL Error Handling
export const createArticle = async (
  parent: unknown,
  args: CreateArticleInput,
  ctx: ResolverContext
): Promise<CreateArticleResult> => {
  try {
    // Implementation
    return { success: true, article }
  } catch (error) {
    return {
      success: false,
      errorCode: ErrorCode.INTERNAL_ERROR,
      errorMessage: 'Failed to create article',
    }
  }
}
```

### Database Migration Patterns

```sql
-- migrations/2024_01_15_123456_add_user_preferences.sql
-- UP
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);

-- DOWN
DROP INDEX IF EXISTS idx_users_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS preferences;
```

## Testing Requirements

### Test Coverage Standards

- **Minimum Coverage**: 80% for all new code
- **Critical Paths**: 95% coverage for authentication, payment, data integrity
- **Unit Tests**: All business logic functions
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

### Testing Patterns

```typescript
// ✅ Good: Descriptive test structure
describe('ArticleService', () => {
  describe('createArticle', () => {
    it('should create article with valid URL and return success', async () => {
      // Arrange
      const validUrl = 'https://example.com/article'
      const mockUser = createMockUser()

      // Act
      const result = await articleService.createArticle(validUrl, mockUser)

      // Assert
      expect(result.success).toBe(true)
      expect(result.article).toBeDefined()
      expect(result.article.url).toBe(validUrl)
    })

    it('should return error for invalid URL format', async () => {
      // Test implementation
    })
  })
})
```

### Migration from Mocha to Jest

When encountering Mocha/Chai tests:

1. Assess complexity of migration
2. If simple, migrate to Jest
3. If complex, add note for future migration
4. Never break existing functionality

## Documentation Standards

### Code Documentation

```typescript
/**
 * Processes article content and extracts metadata
 * @param url - The article URL to process
 * @param options - Processing options
 * @returns Promise resolving to processed article data
 * @throws {ValidationError} When URL format is invalid
 * @throws {NetworkError} When article cannot be fetched
 */
export async function processArticle(
  url: string,
  options: ProcessingOptions = {}
): Promise<ProcessedArticle> {
  // Implementation
}
```

### API Documentation

- Update GraphQL schema descriptions
- Maintain OpenAPI specs for REST endpoints
- Include example requests/responses
- Document error codes and meanings

### README Updates

When adding features:

1. Update relevant README.md files
2. Include setup instructions
3. Document new environment variables
4. Add troubleshooting information

## Security Considerations

### Input Validation

```typescript
// ✅ Always validate inputs
export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
```

### Authentication Patterns

- Always verify JWT tokens
- Implement proper RBAC checks
- Use parameterized queries
- Sanitize user inputs
- Log security events

### Secrets Management

- Never commit secrets to version control
- Use environment variables
- Implement proper rotation
- Use encrypted storage for sensitive data

## Communication Protocols

### Pull Request Guidelines

1. **Title**: Clear, descriptive summary
2. **Description**: Context, changes, and impact
3. **Testing**: Evidence of testing performed
4. **Documentation**: Updates to relevant docs
5. **Breaking Changes**: Clear indication if any

### Commit Message Format

```
type(scope): brief description

Detailed explanation of changes and reasoning.

Fixes #issue-number
```

Types: feat, fix, docs, style, refactor, test, chore

### Issue Reporting

When encountering issues:

1. Provide complete context
2. Include reproduction steps
3. Suggest potential solutions
4. Reference related code sections

## Contribution Workflow

### Before Starting Work

1. Review cursor rules and this agents guide
2. Understand the specific requirements
3. Plan the implementation approach
4. Consider cross-platform impacts

### During Development

1. Follow established patterns
2. Write tests alongside code
3. Update documentation as needed
4. Consider backward compatibility

### Before Submitting

1. Run full test suite
2. Check linting and formatting
3. Verify documentation updates
4. Test across affected platforms

### Code Review Process

1. Address all feedback thoroughly
2. Explain reasoning for design decisions
3. Update tests based on review comments
4. Ensure CI/CD pipeline passes

## Troubleshooting and Support

### Common Issues and Solutions

#### Build Failures

- Check Node.js version (should be 22)
- Verify all dependencies installed
- Clear node_modules and reinstall
- Check TypeScript compilation errors

#### Test Failures

- Run tests in isolation
- Check for async/await issues
- Verify mock configurations
- Ensure test data cleanup

#### Database Issues

- Check migration status
- Verify connection strings
- Review query performance
- Check index usage

### Getting Help

1. **Documentation**: Check existing docs first
2. **Code Search**: Look for similar implementations
3. **Issue Tracking**: Search existing issues
4. **Team Communication**: Reach out to maintainers

### Performance Considerations

- Monitor bundle sizes
- Optimize database queries
- Implement proper caching
- Use lazy loading appropriately
- Profile critical paths

## Conclusion

This guide serves as a living document for AI agents contributing to Omnivore. It should be updated as the project evolves and new patterns emerge. The goal is to maintain high code quality, security, and user experience across all platforms while enabling efficient AI-assisted development.

Remember: The ultimate goal is creating a robust, maintainable, and user-friendly read-it-later solution that serves users across web, mobile, and browser extension platforms.
