# Build Tools and Development - Cursor Rules

## Monorepo Management

- Use Lerna for package management across the monorepo
- Each service should be in its own package under `packages/` or `pkg/`
- Use workspace dependencies appropriately
- Implement proper build ordering
- Use consistent package.json structures

## Docker and Containerization

- Each service should have its own Dockerfile
- Use multi-stage builds for production images
- Implement proper health checks
- Use docker-compose for local development
- Follow security best practices in containers
- Use .dockerignore files appropriately

## TypeScript Configuration

- Use strict TypeScript configuration
- Extend from base tsconfig.json
- Use proper module resolution
- Configure path mapping for imports
- Use composite projects for monorepo builds

## Code Quality Tools

- Use ESLint with TypeScript support
- Follow Prettier formatting
- Use consistent naming conventions
- Implement proper logging
- Use environment variables for configuration

## Development Workflow

- Use feature branches for development
- Implement proper CI/CD pipelines
- Use semantic versioning
- Write meaningful commit messages
- Use pull request templates
- Implement proper code review processes

## Environment Management

- Use different configurations for dev/staging/prod
- Implement proper secrets management
- Use environment-specific docker-compose files
- Implement proper logging levels
- Use monitoring and alerting

## Performance Monitoring

- Implement proper caching strategies
- Monitor build times and optimize
- Use proper bundling strategies
- Implement performance metrics collection
- Monitor application performance in production
