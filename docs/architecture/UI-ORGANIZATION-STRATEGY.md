# UI Organization & Layout Strategy

**Status**: Planning / Discussion
**Relevant ARCs**: ARC-009 (Frontend Feature Parity), Future Layout ARCs
**Last Updated**: 2025-10-05

## Context

As we migrate from the legacy system to the new Vite-based frontend, we need to thoughtfully organize UI elements for optimal user experience. This document captures insights from the legacy system and proposes strategies for the new application.

## Legacy System Analysis

### Screenshots Reference
Located in `/omni-legacy-images/` - 6 screenshots showing:
- Documentation sidebar with comprehensive navigation
- Settings page with full categorization
- Home page with left sidebar navigation
- Mobile navigation drawer
- Library view with saved search filters

### Legacy Layout Structure

**Left Sidebar Hierarchy:**
```
┌─ Primary Navigation (Top)
│  ├─ Home
│  ├─ Library
│  ├─ Subscriptions
│  ├─ Highlights
│  ├─ Archive
│  └─ Trash
│
├─ Shortcuts Section (Middle)
│  ├─ Labels
│  ├─ Subscriptions
│  └─ Saved Searches (Expandable)
│      ├─ Inbox
│      ├─ Continue Reading
│      ├─ Non-Feed Items
│      ├─ Highlights
│      ├─ Unlabeled
│      ├─ Oldest First
│      ├─ Files
│      └─ Archived
│
└─ User Controls (Bottom Left)
   ├─ User Profile (Demo User)
   └─ Add Button
```

**Settings Page Organization:**
- Account, API Keys, Emails
- Feeds, Subscriptions, Labels
- Saved Searches, Pinned Searches
- Rules, Integrations, Install
- Feedback, Contribute, Documentation

## Key Design Decisions to Consider

### 1. Primary Action Placement

**Legacy Approach**: Add button in bottom-left corner with user profile
- Creates visual "anchor" where users expect profile/actions
- Keeps primary actions together in one location
- Mobile-friendly (thumb zone)

**Current Implementation**: Add button in top-right corner
- Modern web app pattern
- Separate from user controls
- May be harder to reach on mobile

**Options for Future:**
- **Option A**: Return to bottom-left for consistency with user profile
- **Option B**: Keep top-right + add FAB (Floating Action Button) for mobile
- **Option C**: Command palette (⌘K) for power users + visible button for discoverability
- **Option D**: Context-aware placement (varies by page)

### 2. Navigation Hierarchy

**Principles:**
1. **Core navigation** should be simple and always visible
2. **Power features** (saved searches, advanced filters) in collapsible sections
3. **Organization tools** (labels, searches) grouped logically
4. **User/settings** at bottom (natural anchor point)

**Proposed Structure:**
```
┌─ Core Navigation (Always Visible)
│  ├─ Home / Library
│  ├─ Subscriptions
│  ├─ Highlights
│  └─ Archive
│
├─ Filters & Organization (Collapsible)
│  ├─ Labels (with count badges)
│  └─ Saved Searches
│      ├─ Quick filters (Inbox, Reading, etc.)
│      └─ Custom searches
│
├─ Integrations (Collapsible) - Future
│  ├─ Connected Apps
│  └─ RSS Feeds
│
└─ User Controls (Bottom)
   ├─ Settings
   └─ Profile / Add Actions
```

### 3. Settings Organization

**Grouping Strategy:**
```
Personal
├─ Account Details
├─ Profile & Preferences
└─ Emails & Notifications

Library Management
├─ Labels
├─ Saved Searches
├─ Pinned Searches
└─ Rules & Automation

Integrations & Apps
├─ Connected Apps (Readwise, Notion, etc.)
├─ RSS Feeds & Subscriptions
├─ API Keys
├─ Webhooks
└─ Browser Extensions

Advanced
├─ Import/Export Data
├─ Keyboard Commands
└─ Account Management

Community
├─ Feedback
├─ Contribute
└─ Documentation
```

### 4. Responsive Considerations

**Mobile (<768px):**
- Hamburger menu for navigation
- FAB for primary actions (Add Link)
- Bottom navigation bar for core functions
- Swipe gestures for common actions

**Tablet (768px-1024px):**
- Collapsible sidebar
- Touch-optimized targets (min 44px)
- Adaptive layouts (grid → list)

**Desktop (>1024px):**
- Persistent sidebar
- Keyboard shortcuts prominent
- Multi-column layouts where appropriate

## Future Layout Work

These considerations will be implemented in:

1. **ARC-009**: Frontend Library Feature Parity
   - Implement responsive layouts
   - Add keyboard navigation
   - Create modals and dialogs

2. **Future Layout ARC** (TBD):
   - Comprehensive responsive design
   - Mobile-first navigation patterns
   - Advanced layout options (grid/list/compact)
   - Customizable sidebar organization

3. **Settings Redesign** (TBD):
   - Implement grouped settings structure
   - Search within settings
   - Quick actions and shortcuts

## Design Philosophy

**Goals:**
- **Logical organization**: Related features grouped together
- **Discoverability**: Important actions easy to find
- **Efficiency**: Power users can work quickly
- **Accessibility**: Keyboard navigation, screen readers
- **Consistency**: Patterns that work across mobile/desktop

**Avoid:**
- Hidden features with no visual cues
- Inconsistent navigation patterns
- Mobile-hostile interactions on small screens
- Cluttered UI with too many options visible

## Next Steps

1. ✅ Document strategy (this file)
2. ⏳ Implement ARC-010A (Minimal Reader) with basic layout
3. ⏳ Build out ARC-009 with full layout considerations
4. ⏳ Create dedicated Layout/UX ARC for comprehensive work
5. ⏳ User testing to validate organizational decisions

## References

- Legacy screenshots: `/omni-legacy-images/`
- Migration backlog: `/docs/architecture/unified-migration-backlog.md`
- Current implementation: `packages/web-vite/src/pages/LibraryPage.tsx`
