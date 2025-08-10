# Omnivore Cursor Rules

This directory contains organized cursor rules for the Omnivore project, structured according to development domains and technologies.

## Why Cursor Rules?

Cursor rules provide AI-powered development assistance by establishing project-specific guidelines, patterns, and best practices. These rules help ensure consistency across the codebase and guide AI assistants in making contextually appropriate suggestions.

## Table of Contents

- [Rules](#rules)
  - [Frontend Frameworks and Libraries](#frontend-frameworks-and-libraries)
  - [Backend and Full-Stack](#backend-and-full-stack)
  - [Mobile Development](#mobile-development)
  - [Database and API](#database-and-api)
  - [Testing](#testing)
  - [Build Tools and Development](#build-tools-and-development)
  - [Language-Specific](#language-specific)
  - [Security](#security)
- [How to Use](#how-to-use)
- [Contributing](#contributing)

## Rules

### Frontend Frameworks and Libraries

- **[frontend-frameworks-cursorrules.md](./frontend-frameworks-cursorrules.md)** - Next.js, React, and frontend development patterns for the Omnivore web application

### Backend and Full-Stack

- **[backend-fullstack-cursorrules.md](./backend-fullstack-cursorrules.md)** - GraphQL API patterns, microservices architecture, and content processing rules

### Mobile Development

- **[mobile-development-cursorrules.md](./mobile-development-cursorrules.md)** - iOS (Swift/SwiftUI), Android (Kotlin/Compose), and browser extension development guidelines

### Database and API

- **[database-api-cursorrules.md](./database-api-cursorrules.md)** - PostgreSQL, Redis, database migrations, and data consistency patterns

### Testing

- **[testing-cursorrules.md](./testing-cursorrules.md)** - Jest (preferred), Mocha/Chai (legacy), E2E testing, and testing patterns

### Build Tools and Development

- **[build-tools-development-cursorrules.md](./build-tools-development-cursorrules.md)** - Lerna monorepo, Docker, TypeScript configuration, and development workflow

### Language-Specific

- **[language-specific-cursorrules.md](./language-specific-cursorrules.md)** - TypeScript, Node.js, Swift, Kotlin, JavaScript, and SQL coding standards

### Security

- **[security-cursorrules.md](./security-cursorrules.md)** - Authentication, data security, API security, and container security guidelines

## How to Use

1. **Main Rules**: The root `.cursorrules` file contains the core project overview and architecture rules
2. **Categorized Rules**: Individual files in this directory provide detailed guidelines for specific domains
3. **AI Integration**: These rules are automatically used by Cursor AI to provide contextual assistance
4. **Reference**: Use these files as reference when developing features or reviewing code

## Contributing

When adding new rules or updating existing ones:

1. **Categorization**: Place rules in the most appropriate category file
2. **Consistency**: Maintain consistent formatting and structure across files
3. **Documentation**: Provide clear explanations and context for complex rules
4. **Best Practices**: Focus on project-specific patterns and architectural decisions
5. **Examples**: Include examples where helpful for clarity

### Guidelines for Rule Creation

- **Specificity**: Focus on Omnivore-specific patterns rather than general coding practices
- **Context**: Provide context about the monorepo structure and service interactions
- **Practicality**: Ensure rules are actionable and can be followed by developers
- **Maintenance**: Keep rules up-to-date with the current codebase and architecture

## Project Context

Omnivore is a complete, open-source read-it-later solution with:

- GraphQL API backend (Node.js/TypeScript)
- Next.js frontend with TypeScript
- PostgreSQL database with vector extensions
- Redis for caching and queues
- Microservices for content processing
- Mobile apps (iOS/Android)
- Browser extensions

These rules help maintain consistency across all platforms and ensure high-quality development practices throughout the ecosystem.
