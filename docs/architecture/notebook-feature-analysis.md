# Notebook Feature Analysis

**Date**: 2025-01-16
**Context**: Understanding how Omnivore's "Notebook" feature works and how it fits into our architecture

---

## What is the Notebook?

The **Notebook** is a free-form note area attached to each library item, separate from highlights. Think of it as:

- **Highlights** = Specific text selections from the article (micro-notes)
- **Notebook** = Free-form note about the entire document (macro-note)

### Use Cases

1. **Document Summary**: Write your own summary of the article
2. **Reactions**: "This article made me think about X"
3. **Questions**: "I need to research Y further"
4. **Connections**: "This relates to concept Z I learned in..."
5. **Action Items**: "Follow up with the author about..."
6. **Meta-notes**: Notes about the document that don't fit as highlights

---

## How It's Currently Implemented (Legacy Omnivore)

### Database Schema

**Clever hack**: The notebook is stored in the `highlight` table with a special type:

```typescript
// highlight entity
export enum HighlightType {
  Highlight = 'HIGHLIGHT',  // Normal text highlights
  Redaction = 'REDACTION',   // Remove text from page
  Note = 'NOTE',             // The "notebook" for the document
}
```

**Key fields for notebook**:
- `highlightType` = 'NOTE'
- `annotation` = The free-form note text
- `quote`, `prefix`, `suffix`, `patch` = NULL (not needed for document-level notes)
- `libraryItemId` = Which document this note belongs to
- One notebook per library item (enforced in application logic)

### UI/UX

**Location**:
- Accessed via "Notebook" button in reader view
- Opens sidebar or modal

**Layout**:
```
┌─────────────────────────────────────────┐
│  NOTEBOOK (for entire document)         │
│  ┌─────────────────────────────────┐   │
│  │ Free-form text area             │   │
│  │ "Add notes to this document..." │   │
│  │                                 │   │
│  │ [Auto-saves as you type]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  HIGHLIGHTS (text selections)           │
│  ┌─────────────────────────────────┐   │
│  │ "Quoted text from article"      │   │
│  │ └─ Annotation: "My thoughts"    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ "Another quoted text"           │   │
│  │ └─ Annotation: "More thoughts"  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features**:
- Auto-save (saves after typing stops for a few seconds)
- Shows "Saved" status
- Can delete entire notebook
- Notebook always appears at the top, highlights below

---

## Design Considerations for Our Implementation

### Option 1: Keep Current Design (Notebook = Special Highlight Type)

**Pros**:
- ✅ Already works this way in legacy code
- ✅ Simpler migration (one less entity to create)
- ✅ Highlights and notebooks share the same table
- ✅ Less code to write

**Cons**:
- ⚠️ Conceptually odd (a "note" is not really a "highlight")
- ⚠️ Entity comment says: "to be deleted in favor of note on library item"
- ⚠️ Mixing two different concepts in one table
- ⚠️ Query complexity (always need to filter by type)

**Code comment from entity**:
```typescript
Note = 'NOTE', // to be deleted in favor of note on library item
```
This suggests the Omnivore team was considering moving it!

---

### Option 2: Move Notebook to LibraryItem Table (Cleaner Design)

**Pros**:
- ✅ Cleaner separation of concerns (notebook is document-level, highlights are text-level)
- ✅ Simpler queries (no need to filter highlights by type)
- ✅ More intuitive data model
- ✅ Easier to understand for new developers
- ✅ Follows the original team's planned direction

**Cons**:
- ⚠️ Need to migrate data (convert type='NOTE' highlights to library_item.notebook column)
- ⚠️ Slightly more complex initial implementation

**Proposed Schema**:
```sql
ALTER TABLE omnivore.library_item
ADD COLUMN notebook TEXT,
ADD COLUMN notebook_updated_at TIMESTAMPTZ;
```

**Migration**:
```sql
-- Copy existing notebooks from highlights table
UPDATE omnivore.library_item li
SET
  notebook = h.annotation,
  notebook_updated_at = h.updated_at
FROM omnivore.highlight h
WHERE h.library_item_id = li.id
  AND h.highlight_type = 'NOTE';

-- Delete the old notebook-type highlights
DELETE FROM omnivore.highlight
WHERE highlight_type = 'NOTE';
```

---

## Recommendation: Option 2 (Move to LibraryItem)

### Why?

1. **Cleaner architecture**: Notebook is document-level metadata, not a text highlight
2. **Simpler queries**: No need to filter highlights by type everywhere
3. **Aligns with original team's intent**: The comment suggests they wanted to do this
4. **Better UX**: Makes it clearer that notebook is different from highlights
5. **Future-proof**: Easier to add more document-level fields later

### Implementation Plan

**Backend (NestJS)**:

1. **Database Migration** (new migration 0192):
   ```sql
   -- Add notebook columns to library_item
   ALTER TABLE omnivore.library_item
   ADD COLUMN notebook TEXT,
   ADD COLUMN notebook_updated_at TIMESTAMPTZ;

   -- Migrate existing notebooks
   UPDATE omnivore.library_item li
   SET
     notebook = h.annotation,
     notebook_updated_at = h.updated_at
   FROM omnivore.highlight h
   WHERE h.library_item_id = li.id
     AND h.highlight_type = 'NOTE';

   -- Clean up old notebooks
   DELETE FROM omnivore.highlight
   WHERE highlight_type = 'NOTE';
   ```

2. **Update LibraryItemEntity**:
   ```typescript
   @Entity({ name: 'library_item', schema: 'omnivore' })
   export class LibraryItemEntity {
     // ... existing fields ...

     @Column('text', { nullable: true })
     notebook?: string | null;

     @Column('timestamp', { nullable: true })
     notebookUpdatedAt?: Date | null;
   }
   ```

3. **GraphQL Schema**:
   ```graphql
   type LibraryItem {
     # ... existing fields ...
     notebook: String
     notebookUpdatedAt: Date
   }

   input UpdateNotebookInput {
     itemId: String!
     notebook: String!
   }

   type Mutation {
     updateNotebook(input: UpdateNotebookInput!): LibraryItem!
   }
   ```

4. **LibraryService methods**:
   ```typescript
   async updateNotebook(userId: string, itemId: string, notebook: string) {
     const item = await this.libraryItemRepository.findOne({
       where: { id: itemId, userId }
     });

     if (!item) throw new NotFoundException();

     item.notebook = notebook;
     item.notebookUpdatedAt = new Date();

     return await this.libraryItemRepository.save(item);
   }
   ```

**Frontend (web-vite)**:

1. **Update GraphQL queries** to include notebook field
2. **Create NotebookEditor component**:
   - Text area for free-form notes
   - Auto-save functionality (debounced)
   - "Saved" indicator
3. **Add to ReaderPage**:
   - Notebook button in reader toolbar
   - Opens sidebar or modal with notebook at top, highlights below
4. **Mutation hooks**:
   - `useUpdateNotebook()` hook

---

## Comparison: Notebook vs. Highlights

| Aspect | Notebook | Highlights |
|--------|----------|------------|
| **Scope** | Entire document | Specific text selection |
| **Quantity** | One per document | Many per document |
| **UI Location** | Top of sidebar | List below notebook |
| **Input Type** | Free-form text area | Selected text + optional note |
| **Use Case** | Document-level thoughts | Text-level annotations |
| **Data Model** | `library_item.notebook` | `highlight` table |
| **Export** | Include in document exports | Export as list |

---

## User Workflow

### Creating a Notebook

1. Open article in reader
2. Click "Notebook" button in toolbar
3. Sidebar opens showing notebook area at top
4. Type free-form notes
5. Auto-saves after typing stops (2-3 seconds)
6. Shows "Saved" indicator

### Viewing Notebook + Highlights Together

1. Click "Notebook" button
2. See notebook (free-form notes) at top
3. Scroll down to see all highlights
4. Both are part of the same unified view

### Exporting

When exporting highlights to Obsidian/Notion:
```markdown
# Article Title

## Notebook
[Free-form notes here]

## Highlights
- "Quoted text" - Annotation
- "Another quote" - Annotation
```

---

## Integration with Our Architecture

### Where It Fits

**Notebook complements our knowledge capture strategy**:

1. **During Reading**:
   - Article text (main content)
   - Highlights (specific insights)
   - Notebook (overall thoughts)

2. **After Reading**:
   - Review notebook for summary
   - Export notebook + highlights to Obsidian
   - Search across notebooks (future: RAG over notebooks)

3. **Knowledge Synthesis**:
   - Notebooks become personal summaries
   - Highlights are specific evidence
   - Together = comprehensive capture

### Future AI Integration

**Potential AI features** (post-MVP):
- "Generate notebook summary from my highlights"
- "Compare my notebook to AI summary" (learning check)
- "Find similar notebooks across my library" (semantic search)
- "Synthesize insights from multiple notebooks" (RAG)

---

## Implementation Priority

### Short-term (ARC-010: Reading & Highlights)

**MVP for notebook**:
- ✅ Database migration (add notebook column)
- ✅ Backend mutation (updateNotebook)
- ✅ Simple text area in reader
- ✅ Auto-save
- ❌ No fancy editor (plain text is fine)
- ❌ No AI features

**Time estimate**: 2-3 days including migration and frontend

### Medium-term (ARC-019: Unified Highlights)

**Enhanced notebook**:
- Rich text editor (markdown support)
- Include notebook in highlights export
- Search across notebooks

### Long-term (Future)

**Advanced features**:
- AI-generated notebook suggestions
- Notebook templates
- Cross-notebook synthesis

---

## Technical Decisions

### Auto-save Strategy

**Debounced save** (like Google Docs):
- Wait 2-3 seconds after user stops typing
- Show "Saving..." indicator
- Show "Saved" when complete
- Show error if save fails

**Why not save on every keystroke?**
- Too many API calls
- Poor UX (network lag)
- Database write overhead

**Implementation**:
```typescript
const [notebook, setNotebook] = useState('');
const debouncedSave = useMemo(
  () => debounce((text: string) => {
    updateNotebookMutation.mutate({ itemId, notebook: text });
  }, 2000),
  [itemId]
);

const handleNotebookChange = (text: string) => {
  setNotebook(text);
  debouncedSave(text);
};
```

### Data Migration Strategy

**Safe migration**:
1. Add new columns to library_item
2. Migrate data from highlights table
3. Keep old data temporarily (don't delete immediately)
4. Test thoroughly
5. Once confirmed working, delete old notebook-type highlights

**Rollback plan**:
- If issues found, old data still in highlights table
- Can restore from backup

---

## Questions & Answers

### Q: Should notebook be markdown or plain text?

**A**: Start with plain text for MVP, add markdown support later if needed.

**Reasoning**:
- Plain text is simpler (no editor library needed)
- Users can still write structured notes
- Can always upgrade later (plain text → markdown is easy)
- Markdown → plain text is lossy (better to start simple)

### Q: Should we allow multiple notebooks per document?

**A**: No, one notebook per document (matches Omnivore design).

**Reasoning**:
- Keeps UI simple
- Matches user mental model (one document = one summary note)
- If users need multiple notes, they can use highlights with annotations
- Can always add "sections" within notebook later if needed

### Q: How does notebook relate to AI digest?

**A**: They're different features:
- **AI Digest** = Daily summary of NEW content (triage)
- **Notebook** = Personal notes while READING content (capture)

**Workflow**:
1. AI Digest shows "Here's what came in"
2. Click into interesting article
3. Read article, write notebook note
4. Add highlights
5. Later: Review notebook + highlights for synthesis

---

## Conclusion

**Notebook is a crucial feature** for knowledge capture:
- Complements highlights (document-level vs. text-level)
- Provides space for personal synthesis
- Part of the "Content Inbox → Knowledge Base" workflow

**Recommendation**:
- Implement as part of ARC-010 (Reading & Highlights)
- Move from highlight table to library_item table (cleaner design)
- Start simple (plain text, auto-save)
- Enhance later (markdown, AI features)

**Priority**: **Medium-High** (include in Phase 1 completion)

---

## Next Steps

1. Add notebook to ARC-010 (Reading Progress & Highlights)
2. Create migration 0192 (add notebook columns)
3. Update LibraryItemEntity
4. Implement updateNotebook mutation
5. Create NotebookEditor component
6. Wire into ReaderPage
7. Test thoroughly
8. Update export functionality to include notebook
