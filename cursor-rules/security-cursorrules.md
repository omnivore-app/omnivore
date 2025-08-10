# Security - Cursor Rules

## Authentication and Authorization

- Implement proper authentication (JWT)
- Use secure session management
- Implement proper role-based access control
- Validate user permissions on every request
- Use secure token storage practices
- Implement proper logout functionality

## Data Security

- Use HTTPS everywhere
- Validate all inputs server-side
- Implement proper SQL injection prevention
- Use parameterized queries
- Sanitize user-generated content
- Implement proper XSS prevention

## API Security

- Implement proper CORS policies
- Use rate limiting to prevent abuse
- Implement proper API versioning
- Validate request signatures where appropriate
- Use proper error messages (don't leak sensitive info)
- Implement request/response logging for audit

## Secrets Management

- Use environment variables for secrets
- Never commit secrets to version control
- Use proper secrets rotation
- Implement proper access controls for secrets
- Use encrypted storage for sensitive data
- Regular security audits of dependencies

## Container Security

- Use minimal base images
- Run containers as non-root users
- Implement proper network segmentation
- Use security scanning for container images
- Keep base images updated
- Implement proper secrets management in containers

## Browser Extension Security

- Implement proper content security policies
- Handle permissions appropriately
- Validate all external communications
- Use secure storage for sensitive data
- Implement proper sandboxing
- Regular security reviews of extension code
