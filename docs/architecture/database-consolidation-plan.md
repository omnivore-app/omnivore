# Database Consolidation Plan

## Overview

As we migrate from Express to NestJS, we'll eventually consolidate the database concerns into the NestJS API package. This document outlines the strategy for this consolidation.

## Current State

```
packages/
├── db/                    # Shared database package
│   ├── migrations/        # SQL migration files
│   ├── src/              # Database utilities and types
│   └── package.json      # Database dependencies
├── api/                  # Express API (uses packages/db)
└── api-nest/             # NestJS API (uses packages/db)
```

## Target State

```
packages/
├── api-nest/             # Consolidated NestJS API
│   ├── src/
│   │   ├── database/     # Database module
│   │   │   ├── entities/ # TypeORM entities
│   │   │   ├── migrations/ # SQL migrations
│   │   │   └── database.module.ts
│   │   └── ...
│   └── package.json
└── api/                  # Legacy Express API (deprecated)
```

## Migration Phases

### Phase 1: Parallel Operation (Current - Slice 1-4)

- Keep `packages/db` as shared dependency
- Both Express and NestJS APIs use the same database package
- Ensures data consistency during migration
- No breaking changes to existing functionality

**Benefits:**

- ✅ Safe migration path
- ✅ Shared database schema
- ✅ No data inconsistencies

### Phase 2: NestJS Database Module (Slice 5)

- Create `src/database/` module in NestJS API
- Move TypeORM entities from `packages/db` to `api-nest/src/database/entities/`
- Implement NestJS-specific database configuration
- Keep migration files in NestJS for better organization

**Tasks:**

- [ ] Create `DatabaseModule` with TypeORM configuration
- [ ] Move entity definitions to NestJS
- [ ] Create database connection service
- [ ] Implement repository pattern with NestJS DI
- [ ] Add database health checks

### Phase 3: Migration Consolidation (Post Express Removal)

- Move migration files from `packages/db/migrations/` to `api-nest/src/database/migrations/`
- Update migration runner to work with NestJS
- Remove `packages/db` dependency entirely
- Clean up unused database utilities

**Benefits:**

- ✅ Single source of truth for database concerns
- ✅ Better integration with NestJS dependency injection
- ✅ Simplified project structure
- ✅ Easier database management and migrations

## Implementation Strategy

### DatabaseModule Structure

```typescript
// src/database/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false, // Always use migrations in production
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```

### Entity Example

```typescript
// src/database/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity('omnivore_user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  name: string

  @CreateDateColumn()
  createdAt: Date
}
```

### Repository Pattern

```typescript
// src/library/library.service.ts
@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryItem)
    private libraryRepo: Repository<LibraryItem>,

    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async saveArticle(url: string, userId: string): Promise<LibraryItem> {
    const user = await this.userRepo.findOne({ where: { id: userId } })

    const libraryItem = this.libraryRepo.create({
      url,
      user,
      status: 'PROCESSING',
    })

    return this.libraryRepo.save(libraryItem)
  }
}
```

## Migration Commands

### Current (Phase 1)

```bash
# Run migrations (shared package)
cd packages/db && yarn migrate

# Both APIs use the same database
```

### Future (Phase 3)

```bash
# Run migrations (NestJS integrated)
cd packages/api-nest && yarn migration:run

# Single API manages database
```

## Risk Mitigation

### Data Safety

- **Always backup database** before major migrations
- **Test migrations** in staging environment first
- **Maintain rollback scripts** for each migration phase

### Compatibility

- **Keep shared interfaces** during transition period
- **Gradual migration** of database concerns
- **Comprehensive testing** at each phase boundary

### Performance

- **Connection pooling** configured properly in NestJS
- **Query optimization** with TypeORM query builder
- **Database indexing** maintained during migration

## Timeline

- **Week 1-4**: Phase 1 - Parallel operation with shared database
- **Week 5-6**: Phase 2 - Begin NestJS database module creation
- **Week 7+**: Phase 3 - Complete consolidation after Express removal

## Success Criteria

### Phase 2 Complete

- [ ] NestJS DatabaseModule fully functional
- [ ] All entities moved to NestJS
- [ ] Database health checks working
- [ ] Repository pattern implemented

### Phase 3 Complete

- [ ] `packages/db` removed entirely
- [ ] All migrations running through NestJS
- [ ] Database concerns fully consolidated
- [ ] Performance maintained or improved

This consolidation will result in a cleaner, more maintainable architecture where database concerns are properly encapsulated within the API that uses them.
