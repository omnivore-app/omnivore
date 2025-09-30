# Entity Migration Process: Express to NestJS

## Overview

This document outlines the repeatable process for migrating database entities from the Express API to NestJS while maintaining compatibility with the existing Postgrator migration system.

## 🔄 **Repeatable Migration Process**

### **Phase 1: Schema Analysis**

1. **Identify target table**: Determine which database table needs entity mapping
2. **Trace migration history**: Find all migrations affecting the table
   ```bash
   cd packages/db
   grep -r "table_name" migrations/ | sort
   ```
3. **Document current schema**: Note all columns, types, constraints, and relationships

### **Phase 2: Entity Creation**

4. **Create TypeORM entity**: Map exactly to existing schema
   ```typescript
   @Entity({ name: 'actual_table_name', schema: 'omnivore' })
   export class EntityName {
     // Map each column exactly as it exists
     @Column('text', { nullable: true }) // Match exact nullability
     columnName?: string
   }
   ```
5. **Add to entities index**: Update `src/user/entities/index.ts`
6. **Update DatabaseModule**: Add entity to entities array
7. **Update domain module**: Add entity to `TypeOrmModule.forFeature([])`

### **Phase 3: Schema Extensions (if needed)**

8. **Create new migration**: Use existing Postgrator system
   ```bash
   cd packages/db
   # Find next migration number
   ls migrations/ | grep -E '^[0-9]+\.do\.' | sort -n | tail -1
   ```
9. **Write migration files**: Create both `.do.` and `.undo.` files
10. **Update entity**: Add new columns to TypeORM entity

### **Phase 4: Validation**

11. **Run migration**: Apply database changes
    ```bash
    cd packages/db
    yarn migrate
    ```
12. **Test entity**: Verify TypeORM can read/write to table
13. **Update services**: Modify services to use new entity
14. **Run tests**: Ensure no regressions

## 📊 **Migration Tracking**

### **Completed Entities**

- ✅ **User** (`omnivore.user`)

  - **Migrations**: 0001, 0006, 0014, 0038, 0067, 0088, 0189 (new)
  - **Columns**: id, firstName, lastName, sourceUsername, source, email, phone, twitterId, name, password, status, role
  - **Entity**: `packages/api-nest/src/user/entities/user.entity.ts`

- ✅ **UserProfile** (`omnivore.user_profile`)

  - **Migrations**: 0019, 0020
  - **Columns**: id, username, private, bio, pictureUrl, userId, createdAt, updatedAt
  - **Entity**: `packages/api-nest/src/user/entities/profile.entity.ts`

- ✅ **UserPersonalization** (`omnivore.user_personalization`)
  - **Migrations**: 0008, 0013, 0026, 0032, 0145, 0174, 0180
  - **Columns**: id, userId, fontSize, fontFamily, theme, margin, libraryLayoutType, librarySortOrder, fields, digestConfig, shortcuts
  - **Entity**: `packages/api-nest/src/user/entities/user-personalization.entity.ts`

### **Next Priority Entities**

- 🔄 **Article/Page** (`omnivore.page`)
- 🔄 **Library Item** (`omnivore.library_item`)
- 🔄 **Highlight** (`omnivore.highlight`)
- 🔄 **Label** (`omnivore.labels`)
- 🔄 **Subscription** (`omnivore.subscriptions`)

## 🛠 **Development Workflow**

### **1. Schema Research**

```bash
# Find all migrations affecting a table
cd packages/db
grep -r "table_name" migrations/ | grep -v ".undo." | sort

# Check current table structure
psql -d omnivore -c "\d omnivore.table_name"
```

### **2. Entity Development**

```bash
# Create entity file
touch packages/api-nest/src/domain/entities/entity-name.entity.ts

# Update index files
# Update module imports
# Update database module
```

### **3. Migration Creation**

```bash
cd packages/db

# Get next migration number
NEXT_NUM=$(( $(ls migrations/ | grep -E '^[0-9]+\.do\.' | sort -n | tail -1 | cut -d. -f1) + 1 ))
printf -v PADDED_NUM "%04d" $NEXT_NUM

# Create migration files
echo "-- Migration $PADDED_NUM" > migrations/${PADDED_NUM}.do.migration_name.sql
echo "-- Migration $PADDED_NUM UNDO" > migrations/${PADDED_NUM}.undo.migration_name.sql
```

### **4. Testing**

```bash
# Run migration
cd packages/db && yarn migrate

# Test NestJS entity
cd packages/api-nest && yarn test src/domain/entities/

# Integration test
yarn test:e2e
```

## 🎯 **Best Practices**

### **Entity Mapping**

- **Exact Schema Match**: Map columns exactly as they exist
- **Migration Comments**: Reference which migrations created each column
- **Nullable Fields**: Match existing nullability constraints
- **Enum Types**: Map PostgreSQL enums to TypeScript enums
- **Relationships**: Add relationships only after both entities exist

### **Migration Strategy**

- **Use Existing System**: Always use Postgrator, never TypeORM migrations
- **Backward Compatible**: New columns should be nullable initially
- **Index Creation**: Add indexes for performance-critical queries
- **Comments**: Document purpose of new columns

### **Validation**

- **Schema Verification**: Ensure entity matches actual table structure
- **Data Integrity**: Test with existing data
- **Performance**: Monitor query performance with new entities
- **Rollback Plan**: Always create undo migrations

## 🔗 **Integration Points**

### **With Express API**

- Both APIs share same database
- Migrations apply to both systems
- No coordination needed for deployment

### **With Frontend**

- New role-based features require frontend updates
- Existing functionality continues to work
- Gradual feature rollout possible

### **With Services**

- Background jobs continue to work
- Queue processing unaffected
- Monitoring systems see same schema

## 📈 **Progress Tracking**

Update this document after each entity migration:

1. ✅ Mark entity as completed
2. 📝 Document migration numbers used
3. 🔗 Link to entity file
4. 📊 Update priority list
5. 🎯 Note any special considerations

This process ensures consistent, safe migration of entities while maintaining full compatibility with the existing system.
