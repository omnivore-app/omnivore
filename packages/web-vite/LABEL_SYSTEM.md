# Label System Architecture

## Overview
The label system allows users to organize library items by applying custom labels. Labels can be created, edited, deleted, and applied to library items.

## Backend (NestJS API)

### Database Schema

**`omnivore.labels` table:**
- `id` (uuid, primary key)
- `user_id` (uuid, references users)
- `name` (text, unique per user)
- `color` (text, hex color code, default: #000000)
- `description` (text, nullable)
- `position` (integer, for ordering)
- `internal` (boolean, system labels cannot be modified/deleted)
- `created_at` (timestamptz)
- `updated_at` (timestamptz, with DEFAULT current_timestamp)

**`omnivore.entity_labels` table:**
- `id` (uuid, primary key)
- `label_id` (uuid, references labels)
- `library_item_id` (uuid, references library items)
- `source` (text, 'user' or 'system')
- `created_at` (timestamptz)

### GraphQL API

**Queries:**
- `labels: [Label!]!` - Get all labels for current user
- `label(id: String!): Label` - Get single label by ID

**Mutations:**
- `createLabel(input: CreateLabelInput!): Label!` - Create new label
- `updateLabel(id: String!, input: UpdateLabelInput!): Label!` - Update existing label
- `deleteLabel(id: String!): DeleteResult!` - Delete label
- `setLibraryItemLabels(itemId: String!, labelIds: [String!]!): [Label!]!` - Set labels on a library item

**Types:**
```graphql
type Label {
  id: ID!
  name: String!
  color: String!
  description: String
  position: Int!
  internal: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateLabelInput {
  name: String!        # 1-100 chars
  color: String        # Hex color (e.g., #FF5733)
  description: String  # 0-500 chars
}

input UpdateLabelInput {
  name: String         # 1-100 chars
  color: String        # Hex color
  description: String  # 0-500 chars
}
```

### Service Layer (`LabelService`)

**Key Methods:**
- `findAll(userId)` - Retrieve all labels for a user
- `findOne(userId, labelId)` - Get single label
- `create(userId, input)` - Create new label with validation
- `update(userId, labelId, input)` - Update label (protects internal labels)
- `delete(userId, labelId)` - Delete label (protects internal labels)
- `setLibraryItemLabels(userId, libraryItemId, labelIds)` - Replace all labels on an item
- `getLibraryItemLabels(userId, libraryItemId)` - Get labels for an item

**Validation:**
- Label names must be unique per user
- Internal (system) labels cannot be modified or deleted
- Color format must be valid hex code
- Name length: 1-100 characters
- Description length: 0-500 characters

## Frontend (Vite/React)

### Components

**`/pages/LabelsPage.tsx`** - Label management interface
- View all labels in a grid layout
- Create new labels with color picker
- Edit existing labels (except internal labels)
- Delete labels with confirmation

**`/components/LabelPicker.tsx`** - Label assignment UI
- Dropdown with checkbox list of available labels
- Select/deselect labels for a library item
- Save/Cancel actions
- Converts label names to IDs before API call

### GraphQL Client (`/lib/graphql-client.ts`)

**Label Hooks:**
- `useLabels()` - Fetch all labels with refetch capability
- `useCreateLabel()` - Create new label
- `useUpdateLabel()` - Update existing label
- `useDeleteLabel()` - Delete label
- `useSetLibraryItemLabels()` - Set labels on library item

**Mutation Pattern:**
```typescript
const { setLibraryItemLabels, loading, error } = useSetLibraryItemLabels()

// Usage:
await setLibraryItemLabels(itemId, ['label-uuid-1', 'label-uuid-2'])
```

### Library Integration

**LibraryPage (`/pages/LibraryPage.tsx`):**
- Displays label chips on each library item
- Label picker button opens LabelPicker component
- Label filter dropdown to filter items by labels
- Server-side filtering via GraphQL query

**Label Display:**
```tsx
{item.labels && item.labels.length > 0 && (
  <div className="article-labels">
    {item.labels.map((label) => (
      <span
        key={label.id}
        className="label"
        style={{ backgroundColor: label.color, color: '#fff' }}
      >
        {label.name}
      </span>
    ))}
  </div>
)}
```

**Label Assignment:**
```tsx
<LabelPicker
  itemId={item.id}
  currentLabels={item.labels?.map(l => l.name) || []}
  onUpdate={(labelNames) => handleLabelsUpdate(item.id, labelNames)}
/>
```

## Data Flow

### Creating a Label
1. User fills out form in LabelsPage
2. Frontend calls `createLabel` mutation
3. Backend validates input
4. Backend creates label in database
5. Frontend refetches labels list

### Assigning Labels to Library Item
1. User opens LabelPicker on a library item
2. User selects/deselects labels
3. User clicks "Save"
4. Frontend converts label names → label IDs
5. Frontend calls `setLibraryItemLabels(itemId, labelIds)`
6. Backend:
   - Verifies all labels belong to user
   - Deletes existing label associations
   - Creates new label associations
   - Returns updated labels
7. Frontend updates UI optimistically
8. Frontend shows success toast

### Filtering by Labels
1. User selects labels in filter dropdown
2. Frontend adds `labels: [labelName1, labelName2]` to search params
3. Backend filters library items with matching labels
4. Results displayed in LibraryPage

## Migration History

**Migration 0191: Fix labels updated_at default**
- Added DEFAULT current_timestamp to `updated_at` column
- Backfilled NULL values with `created_at`
- Added NOT NULL constraint
- Ensures GraphQL non-nullable field returns valid timestamp

## Known Issues & Future Improvements

### Current Issues:
1. **No optimistic updates** - Labels don't appear immediately after assignment
2. **No cache invalidation** - Library items list doesn't refresh after label changes
3. **No label validation on frontend** - Duplicate names not checked before API call

### Recommended Improvements:
1. **Add optimistic UI updates** - Show labels immediately while API call is in progress
2. **Implement cache invalidation** - Refresh library items after label changes
3. **Add label autocomplete** - Match legacy behavior with create-on-the-fly
4. **Add keyboard shortcuts** - Quick label assignment via keyboard
5. **Add label analytics** - Track label usage and suggest cleanup
6. **Add bulk label operations** - Apply labels to multiple items at once
7. **Add label groups/categories** - Organize labels hierarchically

## Comparison with Legacy System

### Legacy (`/packages/web`):
- Uses `pageId` parameter name
- Modal-based UI with autocomplete
- Throttled saves (2 second debounce)
- Optimistic cache updates
- Query invalidation on mutation success

### New System (`/packages/web-vite`):
- Uses `itemId` parameter name
- Dropdown-based UI with checkboxes
- Immediate saves
- No optimistic updates yet
- No cache invalidation yet

## Testing

### Manual Test Flow:
1. Navigate to `/labels`
2. Create a new label "Test Label" with color #FF5733
3. Navigate to library page
4. Click "🏷️ Labels" on a library item
5. Select "Test Label"
6. Click "Save"
7. Verify label appears on the item
8. Use label filter to find items with "Test Label"

### E2E Test Coverage:
See `/packages/api-nest/test/label.e2e-spec.ts` for backend tests

## API Examples

### Create Label
```graphql
mutation {
  createLabel(input: {
    name: "Important"
    color: "#FF5733"
    description: "High priority items"
  }) {
    id
    name
    color
  }
}
```

### Assign Labels to Item
```graphql
mutation {
  setLibraryItemLabels(
    itemId: "abc-123"
    labelIds: ["label-uuid-1", "label-uuid-2"]
  ) {
    id
    name
    color
  }
}
```

### Filter Library Items by Label
```graphql
query {
  libraryItems(
    first: 50
    search: {
      labels: ["Important", "Work"]
    }
  ) {
    items {
      id
      title
      labels {
        id
        name
        color
      }
    }
  }
}
```
