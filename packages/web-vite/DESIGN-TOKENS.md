# Design Tokens Reference Guide

This document provides a quick reference for using Omnivore's design tokens in your components.

## What are Design Tokens?

Design tokens are CSS variables that define our design system's core values (colors, spacing, typography, etc.). They ensure consistency across the application and make it easy to maintain and update the design.

## How to Use

Design tokens are automatically available throughout the app via CSS variables. Use them in your component styles like this:

```css
.my-component {
  padding: var(--space-4);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}
```

## Token Categories

### 1. Spacing Scale (4px base)

Use these for consistent padding, margin, and gaps:

```css
--space-1   /* 4px  */
--space-2   /* 8px  */
--space-3   /* 12px */
--space-4   /* 16px */
--space-5   /* 20px */
--space-6   /* 24px */
--space-8   /* 32px */
--space-10  /* 40px */
--space-12  /* 48px */
--space-16  /* 64px */
```

**Example:**
```css
.card {
  padding: var(--space-4);
  gap: var(--space-3);
}
```

### 2. Typography

**Font Sizes:**
```css
--text-xs    /* 12px */
--text-sm    /* 14px */
--text-base  /* 16px */
--text-lg    /* 18px */
--text-xl    /* 20px */
--text-2xl   /* 24px */
--text-3xl   /* 30px */
--text-4xl   /* 36px */
```

**Font Weights:**
```css
--font-normal    /* 400 */
--font-medium    /* 500 */
--font-semibold  /* 600 */
--font-bold      /* 700 */
```

**Line Heights:**
```css
--leading-tight    /* 1.25 */
--leading-normal   /* 1.5  */
--leading-relaxed  /* 1.75 */
```

**Example:**
```css
.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}
```

### 3. Colors

**Background Colors:**
```css
--color-bg-primary     /* #1a1a1a - Main background */
--color-bg-secondary   /* #2a2a2a - Secondary surfaces */
--color-bg-tertiary    /* #252525 - Tertiary surfaces */
--color-bg-elevated    /* #333333 - Elevated elements */
--color-bg-hover       /* #3a3a3a - Hover states */
```

**Text Colors:**
```css
--color-text-primary    /* #ffffff - Primary text */
--color-text-secondary  /* #d9d9d9 - Secondary text */
--color-text-tertiary   /* #898989 - Tertiary text */
--color-text-muted      /* #666666 - Muted text */
--color-text-disabled   /* #444444 - Disabled text */
```

**Border Colors:**
```css
--color-border-primary    /* #3a3a3a */
--color-border-secondary  /* #444444 */
--color-border-hover      /* #555555 */
```

**Brand Colors:**
```css
--color-accent        /* #ffd234 - Omnivore yellow */
--color-accent-hover  /* #ffdb58 */
--color-accent-text   /* #0d0d0d - Text on accent background */
```

**Semantic Colors:**
```css
--color-primary        /* #4a9eff - Primary blue */
--color-primary-hover  /* #3a8eef */

--color-success       /* #4caf50 - Green */
--color-warning       /* #ff9500 - Orange */
--color-danger        /* #8b0000 - Dark red */
--color-danger-text   /* #ff6b6b - Light red for text */
--color-info          /* #4a9eff - Blue */
```

**Example:**
```css
.button-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
}

.button-primary:hover {
  background: var(--color-primary-hover);
}
```

### 4. Border Radius

```css
--radius-sm   /* 4px  */
--radius-md   /* 6px  */
--radius-lg   /* 8px  */
--radius-xl   /* 12px */
--radius-2xl  /* 16px */
--radius-full /* Fully rounded (pills, circles) */
```

**Example:**
```css
.card {
  border-radius: var(--radius-lg);
}

.avatar {
  border-radius: var(--radius-full);
}
```

### 5. Shadows

```css
--shadow-sm  /* 0 1px 2px rgba(0, 0, 0, 0.2)  */
--shadow-md  /* 0 4px 6px rgba(0, 0, 0, 0.3)  */
--shadow-lg  /* 0 10px 15px rgba(0, 0, 0, 0.4) */
--shadow-xl  /* 0 20px 25px rgba(0, 0, 0, 0.5) */

--shadow-focus-primary  /* Blue focus ring */
--shadow-focus-accent   /* Yellow focus ring */
```

**Example:**
```css
.card {
  box-shadow: var(--shadow-md);
}

.input:focus {
  box-shadow: var(--shadow-focus-primary);
}
```

### 6. Transitions

```css
--transition-fast  /* 0.1s ease */
--transition-base  /* 0.2s ease */
--transition-slow  /* 0.3s ease */
```

**Example:**
```css
.button {
  transition: background var(--transition-base), transform var(--transition-fast);
}
```

### 7. Z-Index Scale

```css
--z-base           /* 0    */
--z-dropdown       /* 10   */
--z-sticky         /* 50   */
--z-fixed          /* 100  */
--z-modal-backdrop /* 500  */
--z-modal          /* 1000 */
--z-popover        /* 1500 */
--z-tooltip        /* 2000 */
```

**Example:**
```css
.sticky-header {
  z-index: var(--z-sticky);
}

.modal {
  z-index: var(--z-modal);
}
```

## Component-Specific Tokens

Pre-configured tokens for common components:

```css
/* Buttons */
--btn-padding-sm: var(--space-2) var(--space-3);
--btn-padding-md: var(--space-3) var(--space-4);
--btn-padding-lg: var(--space-4) var(--space-6);

/* Input fields */
--input-padding: var(--space-3) var(--space-4);
--input-border-width: 1px;
--input-focus-border-color: var(--color-primary);

/* Cards */
--card-padding: var(--space-4);
--card-gap: var(--space-6);

/* Navigation */
--nav-width: 250px;
--nav-item-padding: var(--space-3) var(--space-4);
```

## Utility Classes

Quick utility classes for common patterns:

**Spacing:**
```html
<div class="p-4">Padding 16px</div>
<div class="m-6">Margin 24px</div>
<div class="gap-3">Gap 12px</div>
```

**Typography:**
```html
<p class="text-lg font-medium">Large medium text</p>
<h1 class="text-2xl font-bold">Large bold heading</h1>
```

**Colors:**
```html
<p class="text-muted">Muted text</p>
<div class="bg-secondary">Secondary background</div>
```

**Border Radius:**
```html
<div class="rounded-md">Medium rounded</div>
<img class="rounded-full" />
```

## Best Practices

### ✅ DO:

1. **Use tokens for all spacing, colors, and typography:**
   ```css
   .component {
     padding: var(--space-4);
     color: var(--color-text-primary);
     font-size: var(--text-base);
   }
   ```

2. **Use semantic color names:**
   ```css
   .error-message {
     color: var(--color-danger-text);
     background: var(--color-danger);
   }
   ```

3. **Combine tokens for consistency:**
   ```css
   .card {
     padding: var(--card-padding);
     border-radius: var(--radius-lg);
     background: var(--color-bg-secondary);
     box-shadow: var(--shadow-md);
   }
   ```

### ❌ DON'T:

1. **Don't use hardcoded values:**
   ```css
   /* ❌ Bad */
   .component {
     padding: 16px;
     color: #ffffff;
   }

   /* ✅ Good */
   .component {
     padding: var(--space-4);
     color: var(--color-text-primary);
   }
   ```

2. **Don't create custom z-index values:**
   ```css
   /* ❌ Bad */
   .modal {
     z-index: 9999;
   }

   /* ✅ Good */
   .modal {
     z-index: var(--z-modal);
   }
   ```

3. **Don't mix tokens with hardcoded values:**
   ```css
   /* ❌ Bad */
   .component {
     padding: var(--space-4);
     margin: 20px; /* Hardcoded! */
   }

   /* ✅ Good */
   .component {
     padding: var(--space-4);
     margin: var(--space-5);
   }
   ```

## Migration Guide

When updating existing styles to use design tokens:

1. **Replace hardcoded spacing:**
   - `padding: 16px` → `padding: var(--space-4)`
   - `gap: 12px` → `gap: var(--space-3)`

2. **Replace hardcoded colors:**
   - `color: #ffffff` → `color: var(--color-text-primary)`
   - `background: #2a2a2a` → `background: var(--color-bg-secondary)`

3. **Replace hardcoded sizes:**
   - `font-size: 14px` → `font-size: var(--text-sm)`
   - `border-radius: 6px` → `border-radius: var(--radius-md)`

## Examples

### Card Component
```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-hover);
}
```

### Button Component
```css
.button {
  padding: var(--btn-padding-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.button-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
}

.button-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### Form Input
```css
.input {
  padding: var(--input-padding);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: var(--input-border-width) solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--input-focus-border-color);
  box-shadow: var(--shadow-focus-primary);
}
```

## Contributing

When adding new components:

1. Check if existing tokens can be used
2. If you need a new token, add it to `design-tokens.css`
3. Use semantic naming (describe purpose, not value)
4. Update this documentation with examples

## Questions?

See `src/styles/design-tokens.css` for the complete token definitions.
