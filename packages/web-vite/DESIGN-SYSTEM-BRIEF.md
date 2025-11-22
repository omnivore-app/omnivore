# Omnivore Design System Brief
## A Comprehensive Guide for Design Consultants, Researchers, and Contributors

---

## 🎯 Executive Summary

**Project**: Omnivore - Read-it-later application for saving, organizing, and reading web content
**Goal**: Create a beautiful, functional, and hierarchically pleasing design system that serves power users while remaining accessible to newcomers
**Current State**: Migration from legacy web package to modern Vite-based frontend
**Design Philosophy**: Information-dense yet elegant; prioritize functionality without sacrificing aesthetics

---

## 📋 Table of Contents

1. [Product Vision & Context](#product-vision--context)
2. [User Personas & Use Cases](#user-personas--use-cases)
3. [Current Design System Analysis](#current-design-system-analysis)
4. [Design Challenges & Opportunities](#design-challenges--opportunities)
5. [Visual Hierarchy Principles](#visual-hierarchy-principles)
6. [Component Design Requirements](#component-design-requirements)
7. [Design Research Questions](#design-research-questions)
8. [Deliverables & Participation Guidelines](#deliverables--participation-guidelines)

---

## 1. Product Vision & Context

### What is Omnivore?

Omnivore is a **read-it-later application** that enables users to:
- **Save** web articles, PDFs, and RSS feeds for later reading
- **Organize** content with labels, folders, and search
- **Read** with distraction-free reader mode and progress tracking
- **Highlight** and annotate important passages
- **Sync** across devices with cloud storage

### Target Audience

**Primary Users**:
- **Knowledge workers** - Researchers, writers, students who process large volumes of information
- **Avid readers** - People who save 10-100+ articles per week
- **Information curators** - Those who organize and categorize content systematically

**Usage Patterns**:
- **High-frequency users**: Daily interaction, managing hundreds to thousands of saved items
- **Batch processors**: Save during the day, read in dedicated sessions
- **Cross-device**: Mobile for saving, desktop/tablet for reading

### Competitive Landscape

**Direct Competitors**: Pocket, Instapaper, Raindrop.io, Matter
**Differentiators**: Open-source, privacy-focused, powerful organization features, full-text search

---

## 2. User Personas & Use Cases

### Persona 1: "Research Rachel"
**Profile**: PhD student, 28, saves 30-50 academic articles/week
**Goals**: Organize research by topic, find articles quickly, track reading progress
**Pain Points**: Information overload, difficulty finding saved content, lack of visual organization
**Design Needs**: Clear hierarchy, powerful search/filter, efficient batch operations

### Persona 2: "Tech Tom"
**Profile**: Software engineer, 35, subscribes to 20+ RSS feeds
**Goals**: Stay current with tech news, save tutorials, reference documentation
**Pain Points**: Too many unread items, hard to prioritize, slow interface
**Design Needs**: Quick scanning, visual density options, fast navigation

### Persona 3: "Casual Caroline"
**Profile**: Marketing professional, 42, saves 5-10 articles/week
**Goals**: Casual reading, simple organization, clean interface
**Pain Points**: Overwhelming interfaces, too many features, hard to learn
**Design Needs**: Simplified UI, clear affordances, guided workflows

### Key Use Cases

**Use Case 1: Rapid Triage**
- User opens library with 100+ unread items
- Needs to quickly scan, decide what to read now vs later vs archive
- **Design requirement**: Visual scanning efficiency, batch actions, clear metadata

**Use Case 2: Focused Reading**
- User selects article to read from library
- Needs distraction-free reading with progress tracking
- **Design requirement**: Smooth transition, minimal chrome, progress indicators

**Use Case 3: Research Organization**
- User has articles on 5-6 different topics
- Needs to categorize, tag, and retrieve by topic
- **Design requirement**: Intuitive labeling, multi-select, visual grouping

**Use Case 4: Cross-Device Sync**
- User saves on mobile during commute
- Reads on desktop at home
- **Design requirement**: Responsive design, consistent experience, sync indicators

---

## 3. Current Design System Analysis

### 3.1 Legacy System Strengths

**What Works Well**:
1. **Hover Actions Pattern**: Clean icon-only action bar (📖 📦 🏷️ 🌐 🗑) that appears on hover
   - Reduces visual clutter
   - Familiar interaction pattern
   - Keeps cards compact

2. **Label Chips**: Color-coded labels with `● Label Name` format
   - Visual categorization
   - Quick scanning
   - Consistent 11px font, 5px border-radius

3. **Card Hierarchy**: Clear information prioritization
   - Metadata (flair icons + time) → Title → Author/Source → Labels
   - 2-line title clamp prevents excessive height
   - Reading time and saved date prominent

4. **Dual Layout Modes**: Grid vs List views for different scanning needs
   - Grid: 400px max-width, 150px thumbnail, vertical layout
   - List: Horizontal layout, 55x55px thumbnail, single-line title

5. **Dark Theme Foundation**: `#1a1a1a` base with `#2a2a2a` surfaces
   - Reduces eye strain for long reading sessions
   - Consistent contrast ratios
   - Matches modern app trends

### 3.2 Current System Gaps

**Areas Needing Improvement**:

1. **Inconsistent Spacing**
   - Mix of hardcoded pixel values and inconsistent gaps
   - **Solution**: Design token system with 4px base scale

2. **Button Visual Weight**
   - Primary actions (Read) not sufficiently prominent
   - Secondary actions compete for attention
   - **Solution**: Clear primary/secondary/tertiary hierarchy

3. **Label Presentation**
   - Current: Icon + "Label" text (redundant)
   - Legacy: Icon-only for flair, color chip + text for user labels
   - **Solution**: Differentiate system vs user labels

4. **Density Control**
   - One-size-fits-all card size
   - No user control over information density
   - **Solution**: Compact/comfortable/spacious view modes

5. **Processing State Feedback**
   - Unclear when articles finish processing
   - No visual distinction for PROCESSING vs SUCCEEDED states
   - **Solution**: Loading skeleton, state badges, toast notifications

6. **Mobile Responsiveness**
   - Hover actions don't work on touch devices
   - Cards too large on small screens
   - **Solution**: Touch-friendly fallbacks, adaptive layouts

---

## 4. Design Challenges & Opportunities

### Challenge 1: Information Density vs Readability

**Problem**: Users want to see many items at once (density) but also need to read metadata easily (clarity)

**Design Question**: How do we balance information density with visual clarity?

**Opportunities**:
- User-controlled density settings
- Progressive disclosure (show more on hover/focus)
- Smart defaults based on screen size
- Typography scale that maintains readability at different sizes

**Research Needed**:
- What metadata is most critical for decision-making?
- How many cards should be visible in viewport?
- What's the optimal title length (1-line, 2-line, 3-line)?

---

### Challenge 2: Action Discoverability vs Visual Clutter

**Problem**: 5-7 possible actions per card (read, archive, label, open, delete, share, etc.) create visual noise if always visible

**Design Question**: How do we make actions discoverable without cluttering the interface?

**Current Solutions**:
- ✅ Hover-to-reveal action bar (works on desktop)
- ❌ No touch device solution
- ❌ Actions not keyboard accessible

**Opportunities**:
- Context menus (right-click, long-press)
- Swipe gestures on mobile
- Keyboard shortcuts with visual hints
- "More actions" overflow menu

**Research Needed**:
- Which actions are used most frequently?
- Do users prefer always-visible or hover-reveal?
- How do touch users currently access actions?

---

### Challenge 3: Label System Complexity

**Problem**: Two types of labels with different purposes:
1. **System labels** (flair): favorite ⭐, pinned 📌, newsletter 📧, feed 📡
2. **User labels** (tags): custom categories with colors

**Design Question**: How do we visually distinguish system vs user labels?

**Current Approach**:
- System labels: Icon-only in metadata row
- User labels: Color chip + text below title

**Opportunities**:
- Icon-only for both (saves space)
- Different visual treatments (outline vs filled)
- Hierarchical display (important labels first)
- Collapsible label section for cards with many labels

**Research Needed**:
- Do users understand icon-only labels?
- What's the optimal number of visible labels before "show more"?
- Should labels be clickable for filtering?

---

### Challenge 4: Multi-Selection & Batch Actions

**Problem**: Users need to operate on 10-100+ items at once, but multi-select mode changes the UI significantly

**Design Question**: How do we make batch operations efficient without disrupting the browsing experience?

**Current Issues**:
- Multi-select toggle at top requires conscious activation
- Checkboxes appear on all cards when enabled
- Exit multi-select loses selection

**Opportunities**:
- Persistent selection across mode toggle
- Keyboard shortcuts (Shift+click for range)
- Smart selection (e.g., "select all unread")
- Floating action bar for selected items

**Research Needed**:
- How many items do users typically select?
- What batch operations are most common?
- Should selection persist across navigation?

---

### Challenge 5: Reading Progress Visualization

**Problem**: Progress bars show 0-100% but lack context (started reading vs midway vs nearly done)

**Design Question**: How do we communicate reading state meaningfully?

**Current Approach**:
- Thin progress bar at bottom of thumbnail
- Color changes: Blue (started) → Yellow (midway) → Orange (high) → Green (done)

**Opportunities**:
- Progress percentage text ("45% read")
- Time remaining estimate ("3 min left")
- Visual badges ("In progress", "Finished")
- Calendar heatmap of reading activity

**Research Needed**:
- Do users care about exact percentage?
- Is color-coding sufficient?
- Should "completed" items be visually distinct?

---

### Challenge 6: State Indicators

**Problem**: Articles have multiple states (PROCESSING, SUCCEEDED, ARCHIVED, FAILED) that need clear visual communication

**Design Question**: How do we show state without overwhelming the card design?

**Current Approach**:
- State shown in metadata row as text
- Toast notification when processing completes
- No visual distinction on card

**Opportunities**:
- Loading skeleton during PROCESSING
- Success badge/checkmark when SUCCEEDED
- Failure indicator with retry action
- Greyed out archived items

**Research Needed**:
- Do users understand current state indicators?
- Should failed items be prominently flagged?
- How long should success confirmations be visible?

---

## 5. Visual Hierarchy Principles

### 5.1 Information Hierarchy (Most to Least Important)

**Level 1: Primary Information** (Largest, highest contrast)
- Article title
- Thumbnail/cover image

**Level 2: Supporting Metadata** (Medium size, medium contrast)
- Author name
- Site/source name
- Reading time estimate
- Saved date/time

**Level 3: Organizational Elements** (Smallest, lower contrast)
- Labels/tags
- Progress indicators
- State badges

**Level 4: Actions** (Hidden by default, revealed on interaction)
- Read, Archive, Label, Delete, etc.
- Overflow menu for additional actions

### 5.2 Visual Weight Distribution

**Card Layout Proportions**:
```
┌─────────────────────────────┐
│  Thumbnail (30-40% height)  │ ← High visual weight
├─────────────────────────────┤
│  Metadata Row               │ ← Low weight (12px, muted)
│  ⌚ 2 days ago • 5 min      │
├─────────────────────────────┤
│  Article Title              │ ← Highest weight (16px, bold)
│  (1-2 lines, 700 weight)    │
├─────────────────────────────┤
│  Author | Source            │ ← Medium weight (12px, 400)
├─────────────────────────────┤
│  ● Label1  ● Label2        │ ← Low weight (11px chips)
├─────────────────────────────┤
│  [Progress Bar 4px]         │ ← Very subtle
├─────────────────────────────┤
│  2d ago    [Hover Actions]  │ ← Low weight until hovered
└─────────────────────────────┘
```

### 5.3 Color Hierarchy

**Primary Colors** (User attention):
- Accent Yellow (`#ffd234`): Branding, primary CTAs
- Primary Blue (`#4a9eff`): Links, read button, selections

**Secondary Colors** (State communication):
- Success Green (`#4caf50`): Completed reading
- Warning Orange (`#ff9500`): High progress
- Danger Red (`#8b0000`): Delete, errors

**Neutral Hierarchy** (Information structure):
- Text Primary (`#ffffff`): Titles
- Text Secondary (`#d9d9d9`): Important metadata
- Text Tertiary (`#898989`): Timestamps, labels
- Text Muted (`#666666`): Helper text, placeholders

**Background Hierarchy** (Depth perception):
- BG Primary (`#1a1a1a`): Main canvas
- BG Secondary (`#2a2a2a`): Cards, elevated surfaces
- BG Tertiary (`#252525`): Hover states
- BG Elevated (`#333333`): Modals, dropdowns

### 5.4 Typography Hierarchy

**Scale**:
- Display (24-36px): Page titles
- Heading (16-20px): Card titles, section headers
- Body (14-16px): Readable text
- Caption (11-12px): Metadata, labels
- Micro (10px): Timestamps (use sparingly)

**Weight Distribution**:
- Bold (700): Card titles, primary actions
- Semibold (600): Section headers, active states
- Medium (500): Metadata, timestamps
- Regular (400): Body text, author info

**Line Height**:
- Tight (1.25): Titles, headings
- Normal (1.5): Body text
- Relaxed (1.75): Long-form reading

---

## 6. Component Design Requirements

### 6.1 Library Card Component

**Must-Have Features**:
- ✅ Thumbnail (with fallback placeholder)
- ✅ Title (1-2 line clamp)
- ✅ Metadata (source, author, time, reading time)
- ✅ Labels (color-coded chips)
- ✅ Progress indicator
- ✅ Action buttons (hover-reveal)
- ✅ Multi-select checkbox

**Design Specifications**:
- **Maximum width**: 400px (grid), 100% (list)
- **Minimum height**: Flexible, content-dependent
- **Border radius**: 8px (--radius-lg)
- **Shadow**: Subtle elevation on hover
- **Transition**: 200ms ease for all interactions

**States to Design**:
1. Default (unread, no interaction)
2. Hover (actions revealed, slight lift)
3. Selected (multi-select mode)
4. Processing (loading skeleton or spinner)
5. Failed (error state with retry)
6. Archived (reduced opacity or greyed out)

**Interaction Patterns**:
- Click title/thumbnail → Open in reader
- Click checkbox → Toggle selection
- Hover card → Reveal actions
- Click action → Perform action with feedback

**Responsive Behavior**:
- **Desktop (>1024px)**: 3-4 column grid, hover actions
- **Tablet (768-1024px)**: 2-3 column grid, hover actions
- **Mobile (<768px)**: 1-2 column grid or list view, tap for actions menu

---

### 6.2 Action Button System

**Button Hierarchy**:

**1. Primary Actions** (High emphasis):
- Read article
- Add to library (for discovery feed)
- Style: Filled, brand color, prominent placement

**2. Secondary Actions** (Medium emphasis):
- Archive/Unarchive
- Open original
- Style: Icon-only, neutral color, hover-reveal

**3. Tertiary Actions** (Low emphasis):
- Delete
- Share
- More options (overflow menu)
- Style: Icon-only, neutral color, lower contrast

**Icon Library**:
- Read: 📖 or ▶️
- Archive: 📦 or ⬇️
- Unarchive: ↩ or ⬆️
- Label: 🏷️ or 🔖
- Open: 🌐 or ↗️
- Delete: 🗑 or ✕
- More: ⋯ or ⋮

**Accessibility Requirements**:
- All buttons must have aria-labels
- Keyboard navigation (Tab, Enter, Space)
- Focus indicators (blue ring)
- Tooltips on hover (1s delay)

---

### 6.3 Label/Tag System

**Label Types**:

**System Labels** (Flair):
- ⭐ Favorite
- 📌 Pinned
- 📧 Newsletter
- 📡 Feed
- 🔖 Recommended
- Display: Icon-only in metadata row

**User Labels** (Custom):
- User-defined categories
- Custom colors (from palette)
- Display: `● Label Name` chip format
- Limit: Show 3, "+N more" indicator

**Design Specs**:
- Height: 20px
- Padding: 4px 7px
- Border-radius: 5px
- Font: 11px, 500 weight
- Background: Semi-transparent label color
- Border: 1px solid (same color, darker)

**Color Palette** (for user labels):
- Red: `#ef4444`
- Orange: `#f59e0b`
- Yellow: `#ffd234`
- Green: `#10b981`
- Blue: `#3b82f6`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Gray: `#6b7280`

---

### 6.4 Progress Indicators

**Reading Progress Bar**:
- Position: Overlaid on thumbnail or below labels
- Height: 4px
- Style: Rounded ends (--radius-full)
- Color transitions:
  - 0%: Gray (`#666`)
  - 1-24%: Blue (`#4a9eff`)
  - 25-74%: Yellow (`#ffd234`)
  - 75-99%: Orange (`#ff9500`)
  - 100%: Green (`#4caf50`)

**Processing State**:
- Option A: Loading skeleton (grey pulsing blocks)
- Option B: Spinner icon in thumbnail area
- Option C: Progress bar with "Processing..." text
- **Question for research**: Which provides clearest feedback?

---

### 6.5 Folder/Filter System

**3-Tier Navigation**:

**Tier 1: Top Bar**
- Search input (flexible width, max 600px)
- "+ Add" button (prominent, blue)
- User menu (avatar/icon dropdown)

**Tier 2: Filters Bar**
- Labels dropdown (🏷️ Labels)
- View toggle (☰ / ⊞)
- Multi-select toggle (☑ Select)
- Sort dropdown (Recent ▾)
- Sort order button (↓ / ↑)

**Tier 3: Folder Tabs**
- Inbox (default)
- Archive
- Trash
- Selection indicator (right-aligned)

**Design Specs**:
- Height: 48px per tier
- Padding: 12-16px horizontal
- Gap: 8-12px between elements
- Background: Distinct for each tier
  - Tier 1: `#2a2a2a`
  - Tier 2: `#252525`
  - Tier 3: `#1a1a1a`

---

## 7. Design Research Questions

### 7.1 User Testing Questions

**Card Design**:
1. Can you identify what this article is about without reading it?
2. Which elements on the card help you decide whether to read now or later?
3. Where would you click to perform [action]?
4. How quickly can you scan 10 cards and pick one to read?

**Action Discoverability**:
5. How did you discover the available actions on this card?
6. Which actions do you use most frequently?
7. Is the hover-reveal pattern intuitive or frustrating?
8. How would you perform batch operations (multi-select)?

**Label System**:
9. What's the difference between the icon labels and text labels?
10. How many labels are too many before it feels cluttered?
11. Would you prefer icon-only labels or text labels?
12. How do you use labels to organize your library?

**Information Density**:
13. Is there too much/too little information on each card?
14. What metadata would you add/remove?
15. Would you use a compact view option?
16. How important is the thumbnail image?

### 7.2 A/B Testing Opportunities

**Test 1: Action Button Styles**
- A: Hover-reveal icon bar (current)
- B: Always-visible primary button + overflow menu
- C: Bottom-anchored floating action bar
- **Measure**: Click-through rate, time to action, user preference

**Test 2: Label Display**
- A: Icon + text for all labels
- B: Icon-only for system, text for user labels (legacy)
- C: All text-only labels
- **Measure**: Label recognition, scanning speed, user satisfaction

**Test 3: Card Density**
- A: Compact (no thumbnail, 1-line title)
- B: Comfortable (small thumbnail, 2-line title) [current]
- C: Spacious (large thumbnail, 3-line title + description)
- **Measure**: Scanning efficiency, perceived organization, preference

**Test 4: Progress Indicator**
- A: Bar only (no text)
- B: Bar + percentage text
- C: Bar + time estimate ("3 min left")
- D: Badge only ("In progress", "Finished")
- **Measure**: Comprehension, usefulness, visual clutter perception

### 7.3 Analytics to Track

**Usage Metrics**:
- Most frequently used actions (Read, Archive, Delete, Label, etc.)
- Average time spent in library (scanning vs reading)
- Cards viewed before selecting one
- Multi-select usage frequency
- Label usage patterns (how many labels per item)

**Performance Metrics**:
- Time to first interaction
- Scroll performance with 100+ cards
- Search speed and accuracy
- Filter/sort responsiveness

**Engagement Metrics**:
- Reading completion rate (% of articles read to end)
- Return rate (% of saved articles eventually read)
- Organization activity (labeling, archiving frequency)
- Cross-device usage patterns

---

## 8. Deliverables & Participation Guidelines

### 8.1 What We're Looking For

**Design Deliverables**:

**Option 1: Component Designs**
- High-fidelity mockups (Figma, Sketch, or similar)
- Interactive prototypes (preferred)
- Multiple states designed (default, hover, selected, etc.)
- Responsive variations (desktop, tablet, mobile)
- Design rationale document

**Option 2: Design System Contribution**
- Color palette refinements
- Typography scale optimization
- Spacing/layout system recommendations
- Icon set creation or curation
- Animation/transition guidelines

**Option 3: User Research**
- Usability test findings (5-10 participants)
- A/B test proposals with success criteria
- User journey maps
- Competitive analysis deep-dive
- Accessibility audit and recommendations

**Option 4: Conceptual Explorations**
- Alternative navigation patterns
- Novel information visualization
- Gesture/interaction innovation
- AI-assisted organization features
- Cross-device experience design

### 8.2 Submission Format

**Required Elements**:
1. **Executive Summary** (1-2 pages)
   - Problem statement
   - Proposed solution
   - Key benefits

2. **Design Rationale** (2-5 pages)
   - User research insights
   - Design principles applied
   - Trade-off decisions explained
   - Accessibility considerations

3. **Visual Artifacts** (Figma/Sketch files or equivalent)
   - Component library
   - Example screens
   - Interaction flows
   - Responsive breakpoints

4. **Implementation Notes** (Optional but appreciated)
   - Technical constraints considered
   - CSS/code snippets
   - Animation specifications
   - Performance considerations

### 8.3 Evaluation Criteria

**We'll assess submissions based on**:

**Functionality** (30%)
- Does it solve the stated problem?
- Are all user needs addressed?
- Is it feasible to implement?
- Does it scale (100s-1000s of items)?

**Aesthetics** (25%)
- Visual appeal and polish
- Consistent with brand identity
- Modern design trends
- Professional execution

**Usability** (25%)
- Intuitive interactions
- Clear information hierarchy
- Accessible (WCAG 2.1 AA)
- Keyboard navigation

**Innovation** (20%)
- Novel approaches
- Thoughtful improvements over legacy
- Consideration of edge cases
- Future-proof thinking

### 8.4 Participation Details

**Timeline**: Rolling submissions accepted

**Compensation**: [To be determined - Open source contribution, paid consultation, or design challenge prizes]

**License**: All submissions should be compatible with Omnivore's open-source license (AGPL-3.0)

**Attribution**: Contributors will be credited in the project

**Communication**:
- Questions: [GitHub Discussions or email]
- Feedback: Provided within 2 weeks of submission
- Iteration: Opportunity to refine based on feedback

---

## 9. Reference Materials

### 9.1 Current Design System

**Design Tokens** (CSS Variables):
- See `/packages/web-vite/src/styles/design-tokens.css`
- Complete spacing scale, color palette, typography
- Reference: `/packages/web-vite/DESIGN-TOKENS.md`

**Legacy System**:
- Explore `/packages/web/components/patterns/LibraryCards/`
- Study hover actions, label chips, card layouts
- Stitches CSS-in-JS patterns

### 9.2 Brand Assets

**Colors**:
- Primary: `#ffd234` (Omnivore Yellow)
- Dark theme base: `#1a1a1a` / `#2a2a2a`

**Typography**:
- Primary font: Inter (Google Fonts)
- Display font: Inter (medium-bold weights)

**Logo**: [Link to brand assets]

### 9.3 Competitor Analysis

**Study these for inspiration**:
- Pocket: Card density, reading progress
- Instapaper: Minimalist aesthetics, typography
- Raindrop.io: Visual organization, tags
- Matter: Social features, clean design
- Readwise Reader: Power user features

### 9.4 Accessibility Standards

**Must comply with**:
- WCAG 2.1 Level AA
- Keyboard navigation (all interactive elements)
- Screen reader compatibility (ARIA labels)
- Color contrast ratios (4.5:1 minimum for text)
- Focus indicators (visible on all focusable elements)

---

## 10. Contact & Questions

**Project Maintainers**: [Contact information]

**Design Lead**: [Contact information]

**Community**:
- GitHub: [Repository link]
- Discord: [Server invite]
- Email: [Design feedback email]

---

## Appendix: Key Design Principles

1. **Information First**: Content and metadata take priority over chrome and decoration

2. **Progressive Disclosure**: Show essential information immediately, reveal details on interaction

3. **Consistency Over Novelty**: Familiar patterns create confidence; innovate only where it adds clear value

4. **Density Options**: Different users have different needs; provide choice without overwhelming

5. **Performance Matters**: Smooth 60fps interactions, instant feedback, optimistic UI updates

6. **Accessibility is Non-Negotiable**: Every user deserves full functionality regardless of ability

7. **Mobile-First Thinking**: Design for touch, scale up to mouse/keyboard

8. **Data Respect**: Show what matters, hide what doesn't, let users customize

---

**Thank you for your interest in improving Omnivore's design system!**

We're excited to see your creative solutions and look forward to collaborating with talented designers and researchers who share our vision of building beautiful, functional software that respects users' attention and intelligence.

---

*Document Version*: 1.0
*Last Updated*: [Current date]
*License*: CC BY 4.0 (Creative Commons Attribution)
