# BEM Migration Guide

## Current Status

We are migrating our CSS from nested structure to proper BEM methodology with namespace.

### CSS Class Generation Pattern

Our CSS Modules generate classes in this format:

```css
/* CSS file: alert.module.scss */
.alert { } → .aiuta-alert__alert
.alert--error { } → .aiuta-alert__alert--error
.alert__content { } → .aiuta-alert__alert__content
```

## Completed Migrations

### ✅ Alert Component (alert.module.scss)

**Before:**

```scss
.alertContainer {
}
.error {
}
.activeAlert {
}
.fullTextContent {
}
.button {
}
```

**After (BEM):**

```scss
.alert {
  // Base alert styles

  &--error {
    background: #ef5754;
  }

  &--active {
    bottom: 15px;
  }
}

.alert__content {
  // Content styles

  &--full-width {
    p {
      max-width: 100%;
    }
  }
}

.alert__button {
  // Button styles
}
```

**Generated classes:**

- `.aiuta-alert__alert`
- `.aiuta-alert__alert--error`
- `.aiuta-alert__alert--active`
- `.aiuta-alert__alert__content`
- `.aiuta-alert__alert__content--full-width`
- `.aiuta-alert__alert__button`

### 🔄 Photo Upload Component (photoUpload.module.scss)

**Migration in progress...**

## BEM Structure Guidelines

### 1. Simple Components (Block only)

```scss
// For simple, self-contained components
.spinner {
}
.divider {
}
.overlay {
}
```

### 2. Complex Components (Block + Elements)

```scss
// For components with internal structure
.modal {
  // Base modal styles
}

.modal__header {
  // Header element styles
}

.modal__content {
  // Content element styles
}

.modal__footer {
  // Footer element styles
}
```

### 3. Components with Modifiers

```scss
// Base component
.button {
  // Base button styles

  // Button modifiers
  &--primary {
    background: blue;
  }
  &--secondary {
    background: gray;
  }
  &--large {
    padding: 16px;
  }
  &--disabled {
    opacity: 0.5;
  }
}

// Element modifiers
.button__text {
  &--bold {
    font-weight: bold;
  }
}
```

## Migration Strategy

### Phase 1: Core Components ✅

- [x] Alert
- [x] Photo Upload (partial)

### Phase 2: UI Components

- [ ] Button components
- [ ] Modal components
- [ ] Form components

### Phase 3: Layout Components

- [ ] Header/Footer
- [ ] Navigation
- [ ] Containers

### Phase 4: Page Components

- [ ] Home page
- [ ] Results page
- [ ] History pages

## Best Practices

### DO ✅

```scss
// Clear block definition
.photo-upload {
  display: flex;
}

// Clear element relationship
.photo-upload__container {
  width: 100%;
}

// Clear modifier purpose
.photo-upload--loading {
  opacity: 0.7;
}
```

### DON'T ❌

```scss
// Avoid deep nesting
.photo-upload {
  .container {
    .inner {
      .content {
      } // Too deep
    }
  }
}

// Avoid non-semantic names
.red {
}
.big {
}
.item1 {
}
```

## Generated Class Examples

After migration, clients can customize with predictable class names:

```css
/* Client customization CSS */
.aiuta-photo-upload__qr-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 16px !important;
}

.aiuta-alert__alert--error {
  background: #custom-red !important;
}

.aiuta-button__button--primary {
  background: #brand-color !important;
}
```

## Tools for Migration

### VS Code Find & Replace Patterns

```regex
Find: \.([a-zA-Z][a-zA-Z0-9]*)\s*\{
Replace: .$1 {

Find: \.([a-zA-Z][a-zA-Z0-9]*)\s*\.\s*([a-zA-Z][a-zA-Z0-9]*)
Replace: .$1__$2
```

### Automated Scripts

Consider creating scripts for:

- Finding deeply nested selectors
- Converting camelCase to kebab-case
- Validating BEM structure

## Notes

- File names remain unchanged (e.g., `alert.module.scss`)
- Component imports remain unchanged
- Only internal CSS structure changes
- Generated classes now follow `aiuta-{file}-{class}` pattern
- Perfect for client customization through external CSS
