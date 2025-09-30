# Database Migration Strategy for NestJS API

## Executive Summary

This document outlines the database strategy for migrating from the current Express API to NestJS, addressing PostgreSQL scalability, user management architecture, and role-based access control.

## Current Database Architecture Analysis

### **Existing Schema Overview**

- **Database**: PostgreSQL 11+ with Row Level Security (RLS)
- **Migration System**: Custom migration system with sequential numbering
- **Security Model**: Role-based access with `omnivore_user` and `omnivore_admin` roles
- **Core Tables**: `omnivore.user`, `omnivore.library_item`, `omnivore.article`, etc.
- **Advanced Features**: Vector embeddings, full-text search, JSON metadata

### **Current Role System**

```sql
-- Database Roles
CREATE ROLE omnivore_user;    -- Regular users
CREATE ROLE omnivore_admin;   -- Administrators

-- Application Roles (from API)
enum UserRole { ADMIN = 'admin' }
enum SetClaimsRole { USER = 'user', ADMIN = 'admin' }
```

### **Row Level Security Implementation**

```sql
-- Example from user table
CREATE POLICY update_user on omnivore.user
  FOR UPDATE TO omnivore_user
  USING (id = omnivore.get_current_user_id());
```

## PostgreSQL Scalability Assessment

### **✅ PostgreSQL is Excellent for Massive Scale**

**Why PostgreSQL Works at Scale:**

1. **Proven Track Record**

   - Used by Instagram (1B+ users), Spotify, Discord
   - Handles 100K+ concurrent connections with proper configuration
   - Supports horizontal scaling through partitioning and sharding

2. **Advanced Features for Read-Heavy Workloads**

   - Read replicas for geographic distribution
   - Connection pooling (PgBouncer) for efficient connection management
   - Materialized views for complex queries
   - Vector search support (already implemented in Omnivore)

3. **Built-in Scalability Features**
   - Table partitioning by date/user_id
   - Parallel query execution
   - Advanced indexing (GIN, GiST, BRIN)
   - Full-text search without external dependencies

### **Scaling Strategy for Omnivore**

```sql
-- Example: Partition library_items by user_id for better performance
CREATE TABLE omnivore.library_item (
    -- existing columns
) PARTITION BY HASH (user_id);

-- Create partitions for distribution
CREATE TABLE omnivore.library_item_p1 PARTITION OF omnivore.library_item
    FOR VALUES WITH (MODULUS 4, REMAINDER 0);
```

## User Management Architecture

### **Recommended NestJS User Module Structure**

```typescript
// User Module Architecture
packages/api-nest/src/user/
├── user.module.ts          // User module with TypeORM entities
├── user.service.ts         // User business logic
├── user.controller.ts      // REST endpoints (if needed)
├── user.resolver.ts        // GraphQL resolvers
├── entities/
│   ├── user.entity.ts      // Main user entity
│   ├── profile.entity.ts   // User profile
│   └── user-role.entity.ts // Role assignments
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-role.dto.ts
└── guards/
    ├── role.guard.ts       // Role-based access guard
    └── user-ownership.guard.ts // Resource ownership guard
```

### **Enhanced Role-Based Access Control**

Based on the test personas and workspace DSL, here's the recommended role hierarchy:

```typescript
export enum UserRole {
  // Basic Users
  USER = 'user', // Regular users (Alice, Bob)
  PREMIUM = 'premium', // Premium subscribers (Carol)

  // Power Users
  INTEGRATION_DEVELOPER = 'integration_developer', // API users

  // Administrative
  SUPPORT = 'support', // Customer support
  ADMIN = 'admin', // System administrators (Dave)

  // Special States
  SUSPENDED = 'suspended', // Suspended users (Eve)
  PENDING = 'pending', // Email verification pending
}

export enum Permission {
  // Content Management
  LIBRARY_READ = 'library:read',
  LIBRARY_WRITE = 'library:write',
  LIBRARY_DELETE = 'library:delete',

  // Premium Features
  ADVANCED_SEARCH = 'search:advanced',
  AI_SUMMARIES = 'ai:summaries',
  UNLIMITED_HIGHLIGHTS = 'highlights:unlimited',

  // Integration Features
  API_ACCESS = 'api:access',
  WEBHOOK_MANAGE = 'webhook:manage',

  // Administrative
  USER_MANAGE = 'user:manage',
  SYSTEM_ADMIN = 'system:admin',
}
```

### **Role-Permission Matrix**

| Role                    | Permissions                                | Description                     |
| ----------------------- | ------------------------------------------ | ------------------------------- |
| `user`                  | `library:*`, basic features                | Regular users (Alice, Bob)      |
| `premium`               | `user` + `search:advanced`, `ai:summaries` | Premium subscribers (Carol)     |
| `integration_developer` | `user` + `api:access`, `webhook:manage`    | API developers                  |
| `support`               | `user:manage`, limited admin               | Customer support (Support User) |
| `admin`                 | All permissions                            | System administrators (Dave)    |
| `suspended`             | Read-only access                           | Suspended users (Eve)           |

## Database Migration Plan

### **Phase 1: Parallel Development (Immediate)**

1. **Keep Existing Migrations**

   ```bash
   # Continue using existing system
   packages/db/migrations/0XXX.do.*.sql
   packages/db/migrations/0XXX.undo.*.sql
   ```

2. **Add NestJS TypeORM Integration**
   ```typescript
   // packages/api-nest/src/database/database.module.ts
   @Module({
     imports: [
       TypeOrmModule.forRootAsync({
         imports: [ConfigModule],
         useFactory: (configService: ConfigService) => ({
           type: 'postgres',
           url: configService.get('DATABASE_URL'),
           entities: [User, LibraryItem, Label, /* ... */],
           migrations: ['dist/database/migrations/*.js'],
           synchronize: false, // Use existing migrations
         }),
         inject: [ConfigService],
       }),
     ],
   })
   ```

### **Phase 2: Enhanced User Management (Month 2)**

1. **Create User Module**

   ```bash
   # Generate NestJS user module
   nest g module user
   nest g service user
   nest g resolver user
   ```

2. **Implement Enhanced Roles**

   ```sql
   -- Migration: Add enhanced role support
   ALTER TABLE omnivore.user ADD COLUMN role_name VARCHAR(50) DEFAULT 'user';
   CREATE INDEX idx_user_role ON omnivore.user(role_name);

   -- Create role permissions table
   CREATE TABLE omnivore.role_permissions (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
     role_name VARCHAR(50) NOT NULL,
     permission VARCHAR(100) NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(role_name, permission)
   );
   ```

### **Phase 3: Migration Consolidation (Month 3+)**

1. **Consolidate to TypeORM Migrations**

   ```typescript
   // Switch to TypeORM migration system
   npm run typeorm migration:generate -- -n AddUserRoles
   npm run typeorm migration:run
   ```

2. **Database Cleanup**
   - Archive old migration system
   - Consolidate related tables
   - Optimize indexes for new query patterns

## Implementation Recommendations

### **1. User Module Design**

```typescript
// packages/api-nest/src/user/user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserRole]), ConfigModule],
  providers: [UserService, UserResolver, RoleService],
  exports: [UserService], // Export for auth module
})
export class UserModule {}
```

### **2. Auth-User Integration**

```typescript
// packages/api-nest/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Inject user service
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validateCredentials(email, password)
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.USER, // Default role
    })
    return this.login(user)
  }
}
```

### **3. Role-Based Guards**

```typescript
// packages/api-nest/src/user/guards/role.guard.ts
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler())
    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
  }
}

// Usage in controllers
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN, UserRole.SUPPORT)
@Get('admin-data')
getAdminData() { /* ... */ }
```

### **4. Database Performance Optimizations**

```sql
-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_library_item_user_saved
ON omnivore.library_item(user_id, saved_at DESC);

CREATE INDEX CONCURRENTLY idx_user_role_status
ON omnivore.user(role_name, status);

-- Partial indexes for active users
CREATE INDEX CONCURRENTLY idx_active_users
ON omnivore.user(id) WHERE status = 'ACTIVE';
```

## Migration Timeline

### **Week 1-2: Foundation**

- ✅ Set up TypeORM in NestJS
- ✅ Create basic User module structure
- ✅ Implement role enum and permissions

### **Week 3-4: Integration**

- Connect Auth module to User module
- Implement role-based guards
- Add user management endpoints

### **Week 5-6: Testing & Optimization**

- Comprehensive role-based testing
- Performance optimization
- Database query analysis

## Success Metrics

1. **Performance**: Sub-100ms user lookup times
2. **Security**: All endpoints properly role-protected
3. **Scalability**: Support for 100K+ concurrent users
4. **Maintainability**: Clean separation between auth and user concerns

## Conclusion

PostgreSQL is an excellent choice for massive scale, and the current database architecture is solid. The recommended approach:

1. **Keep PostgreSQL** - It's proven at scale and has advanced features
2. **Create separate User Module** - Clean architecture separation
3. **Enhance role system** - Based on personas and use cases
4. **Gradual migration** - Maintain existing system while building new

This strategy provides a clear path forward while maintaining system stability and preparing for massive scale.
