# Aiuta Iframe Application

## Architecture Overview

### 🏗️ **Core Structure**

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **React Router** (MemoryRouter) for navigation
- **CSS Modules** with BEM methodology
- **RPC communication** with parent SDK

## 🎯 **Key Practices & Conventions**

### **App Modes & URLs**

The app operates in two distinct modes via URL parameters:

- **Main app mode**: `app/` (no modal param) → Small iframe with full application
- **Modal mode**: `app/?modal=share` or `app/?modal=fullscreen` → Fullscreen iframe with specific modal

Both modes establish RPC connection with the parent SDK for communication.

### **Naming Conventions**

#### **File & Directory Structure**

- **Files**: `PascalCase` (e.g., `ErrorSnackbar.tsx`)
- **Directories**: `PascalCase` (e.g., `ErrorSnackbar/`)
- **Exports**: Named exports preferred, default for pages

#### **Variables & Functions**

- **Variables**: `camelCase`, descriptive purpose (`currentUser`, `isGenerating`, `selectedImages`)
- **Functions**: `camelCase`, verb-based action (`handleClick`, `validateInput`, `generateImages`)
- **Event handlers**: `handle` + `Event` + `Target` (`handleClickSubmit`, `handleChangeInput`)
- **Boolean variables**: State-describing (`isVisible`, `hasContent`, `isActive`, `canSubmit`)
  - ✅ `isLoading`, `hasError`, `canEdit`
  - ❌ `shouldShow`, `willSubmit`, `loading`

#### **Constants & Configuration**

- **Constants**: `SCREAMING_SNAKE_CASE` (`API_BASE_URL`, `MAX_UPLOAD_SIZE`)
- **Enum values**: `PascalCase` (`VariantEnum.Generated`, `StatusType.Pending`)
- **Config objects**: `camelCase` (`animationConfig`, `apiSettings`)

#### **Components & Classes**

- **Components**: `PascalCase`, noun-based (`SelectableImage`, `ErrorSnackbar`)
- **Component pattern**: Direct function with explicit props typing (`Component = (props: Props) => {}`)
- **Avoid**: `React.FC` pattern (deprecated approach since React 18+)
- **Props types**: Component name + `Props` (`SelectableImageProps`, `ModalProps`)
- **Hook names**: `use` + `Purpose` (`useImageUpload`, `useAuth`, `useGenerations`)
- **Single responsibility**: One purpose per component (`SelectableImage` vs `DeletableImage`)

#### **Redux & State**

- **Slice names**: Domain-aligned (`generationsSlice`, `uploadsSlice`, `appSlice`)
- **Actions**: Verb-based (`setIsLoading`, `addImage`, `clearSelection`)
- **Selectors**: Property + `Selector` (`isLoadingSelector`, `currentUserSelector`)
- **State shape**: `{ isLoading: boolean, error: string | null, data: { byId: {}, allIds: [] } }`

#### **Best Practices**

- **Self-documenting**: Name should explain what, not how (`getUserProfile` not `fetchUserData`)
- **Consistent terminology**: Use same terms across codebase (`image` vs `photo`, `user` vs `account`)
- **Avoid mental mapping**: `user.name` not `user.n`, `isVisible` not `v`
- **Context-specific**: `handleSubmitForm` not just `handleSubmit` when multiple forms exist
- **Data type hints**: `userList` (array), `userMap` (object), `isUserActive` (boolean)
- **Business domain**: Prefer business terms (`subscription`, `generation`) over technical (`data`, `item`)

#### **Comments Philosophy**

- **Explain WHY, not WHAT**: Focus on reasoning, not obvious actions
- **Business context**: Clarify business rules, API quirks, or domain-specific logic
- **Complex algorithms**: Document non-obvious mathematical or performance optimizations
- **Temporary workarounds**: Explain why and when to revisit
- **No obvious comments**: If code is self-explanatory through good naming, skip comments

### **CSS/Styling Patterns**

#### **CSS Custom Properties** (CSS Variables)

- **Theme tokens**: Colors, spacing, typography in CSS custom properties
- **Component-level**: Local CSS variables for component configuration
- **Responsive values**: CSS variables for responsive design tokens
- **Dark mode**: CSS variable switching for theme variants

#### **Responsive Design Conventions**

- **Mobile-first**: Start with mobile styles, enhance for larger screens
- **Breakpoint variables**: Consistent breakpoint definitions
- **Container queries**: Use when appropriate for component-based responsive design
- **Flexible units**: `rem`, `em`, `%`, `vw/vh` over fixed `px`

#### **Animation Guidelines**

- **Performance-first**: Use `transform` and `opacity` for smooth animations
- **Reduced motion**: Respect `prefers-reduced-motion` setting
- **Duration standards**: Consistent timing (150ms micro, 300ms standard, 500ms complex)
- **Easing functions**: Use meaningful easing (`ease-out` for entrances, `ease-in` for exits)

### **State Management (Redux)**

- **Location**: `src/store/` with domain-driven slices architecture
- **State shape**: `{ isLoading: boolean, error: string | null, data: { byId: {}, allIds: [] } }`
- **Selectors**: Atomic (`valueSelector`) and composed (`createSelector` for complex derived state)
- **Domain slices**: `apiSlice`, `appSlice`, `tryOnSlice`, `qrSlice`, `onboardingSlice`, `uploadsSlice`, `generationsSlice`, `errorSnackbarSlice`

### **Hooks Organization**

```
hooks/
├── app/                 # App initialization, config
├── tryOn/               # Try-on functionality
├── upload/              # Image/QR upload
├── gallery/             # Image galleries
└── results/             # Results handling
```

### **API Services**

- **Location**: `utils/api/`
- **Naming**: `{Domain}ApiService` (e.g., `TryOnApiService`)
- **Analytics**: `{Domain}AnalyticsService` (e.g., `TryOnAnalyticsService`)

### **Icon Components**

#### **Icon Component (`@/components/buttons/Icon`)**

Universal icon component supporting multiple icon formats:

**Supported Formats:**

1. **URL/Path**: `icon="./icons/close.svg"` → `<img>` tag
2. **SVG Path**: `icon="M18.9495 5.05C19.3401..."` → `<svg><path d="..."/></svg>`
3. **SVG Elements**: `icon="<path d='...'/><circle cx='10' cy='10' r='5'/>"` → `<svg><g>...</g></svg>`
4. **Full SVG**: `icon="<svg viewBox='0 0 36 36'>...</svg>"` → rendered as-is (no wrapper)

**Props:**

- `icon: string` - Icon source (any of the 4 formats above)
- `size?: number` - Size in pixels (default: 24, ignored for full SVG)
- `viewBox?: string` - SVG viewBox (default: "0 0 24 24", ignored for full SVG)
- `className?: string` - Additional CSS classes

**Key Features:**

- **currentColor support**: SVG icons inherit text color automatically
- **XSS protection**: All user content sanitized via `sanitizeSvgContent`
- **Format detection**: Automatically detects and handles icon format
- **Full control for full SVG**: Custom size/viewBox preserved when passing complete `<svg>`

#### **IconButton Component (`@/components/buttons/IconButton`)**

Interactive button wrapper around `Icon` with enhanced mobile UX:

**Props:** `IconButtonProps extends IconProps`

- `label: string` - Accessibility label (required)
- `onClick?: () => void` - Click handler
- All `Icon` props inherited

**Key Features:**

- **Automatic mobile enhancement**: Touch padding applied on mobile devices via Redux `isMobile` state
- **Accessibility**: Proper `aria-label` and button semantics
- **Consistent styling**: Uses BEM methodology with mobile modifier (`.iconButton_mobile`)

**Usage Examples:**

```tsx
// Simple SVG path
<Icon icon="M18.9495 5.05..." size={20} />

// External file
<Icon icon="./icons/close.svg" />

// Interactive button
<IconButton icon="M18.9495..." label="Close" onClick={handleClose} />

// Full SVG with custom viewBox (preserved)
<Icon icon='<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>' />
```

**Component Organization:**

```
buttons/
├── Icon/
│   ├── Icon.tsx           # Core icon rendering logic
│   ├── Icon.module.scss   # Basic icon styles
│   └── types.ts           # IconProps interface
└── IconButton/
    ├── IconButton.tsx     # Button wrapper with mobile enhancement
    ├── IconButton.module.scss # Button styles + mobile modifier
    └── types.ts           # IconButtonProps extends IconProps
```

## 🎨 **CSS & Styling**

### **CSS Modules + Auto-Generated BEM**

- **Block**: `.componentName` → `aiuta-component-name` (main component class)
- **Block detection**: Filename `ComponentName.module.scss` + class `.componentName` = main block
- **Block modifier**: `.componentName_active` → `aiuta-component-name--active`
- **Element**: `.elementName` → `aiuta-component-name__element-name`
- **Element detection**: Any class that doesn't match component name and has no `_` prefix
- **Element modifier**: `.element_modifier` → `aiuta-component-name__element--modifier`
- **Rules**: Use camelCase in SCSS, auto-generated to BEM kebab-case
- **Modifier convention**: Use `_` prefix for ALL modifiers (component and element)

### **Other Patterns**

- **Custom properties**: Theme tokens, component variables, responsive values
- **Mobile-first**: Responsive design with flexible units (`rem`, `em`, `%`)
- **Performance**: `transform`/`opacity` animations, `prefers-reduced-motion` support
- **className composition**: Use `[class1, class2].filter(Boolean).join(' ')` to avoid extra spaces
- **NO INLINE STYLES**: All styles must be in CSS modules - never use `style={{}}` prop

## 🔧 **Development Guidelines**

- **File organization**: Co-locate related files, use `index.ts` exports
- **Hook design**: Single responsibility, handle errors via ErrorSnackbar
- **Performance**: Lazy loading for routes, `useCallback`/`useMemo` for expensive ops
- **Build tool**: Vite with SCSS modules and BEM naming
- **Comments**: All code comments must be in English only
- **Comment quality**: Avoid obvious comments; explain WHY, not WHAT. Use only for complex logic or business rules
- **Naming consistency**: Use slice-aligned terminology (`generated`/`uploaded` not `history`/`previously`)
- **Descriptive naming**: Names should clearly indicate purpose, responsibility, and data type
- **No abbreviations**: Use full words (`selectedImages` not `selImgs`, `isGenerating` not `isGen`, `changePhotoButton` not `changePhotoBtn`)
- **Single Responsibility**: Split components by responsibility (e.g., `SelectableImage` vs `DeletableImage`)
- **Domain alignment**: Ensure terminology matches Redux slices and business logic

## 📝 **TODO Priorities**

1. Add selectionSnackbar for bulk actions
2. Optimize bundle size and loading
3. Enhance analytics tracking
4. Improve error boundaries and fallbacks

### **Refactoring Guidelines**

- **Inspect dependencies**: When refactoring component X, check all components that use X and all components X uses
- **Convention compliance**: Look for naming, structure, typing inconsistencies in related code
- **Document findings**: Add items to this list when issues are discovered but can't be immediately fixed
- **Mark as resolved**: Remove items from "Found During Refactoring" list when they are fixed
- **Prioritize impact**: Focus on high-usage components first

## 📖 **Documentation Policy**

**⚠️ IMPORTANT**: This README.md is the **ONLY** documentation file for the **app development**.

- **🎯 Scope**: Internal development documentation for the iframe application
- **📚 SDK Documentation**: Complete SDK documentation available at [docs.aiuta.com](https://docs.aiuta.com/sdk/web/)
- **✅ DO**: Update this file when architecture or practices change
- **❌ DON'T**: Create additional docs/\*.md files for app development
- **📝 Rule**: All app development documentation must be consolidated here for easy maintenance and AI context restoration

## 🤖 **AI Collaboration Guidelines**

**⚠️ CRITICAL FOR EFFECTIVE DEVELOPMENT**: These rules ensure consistent, high-quality collaboration.

### **⚡ REFACTORING CHECKLIST (READ FIRST!)**

Before ANY refactoring work:

- [ ] 🗣️ **DISCUSS** the plan with user first - NO exceptions!
- [ ] 🔍 **ANALYZE** all dependencies (what uses this component, what it uses)
- [ ] 📋 **GET APPROVAL** before making any changes
- [ ] ✅ **FOLLOW** established conventions without reminders

### **📚 Documentation Maintenance**

- **Always update README**: When new agreements are made or important patterns emerge, immediately update this file
- **Keep documentation current**: No outdated information, no dead links, no obsolete patterns
- **Compact but complete**: Include all necessary information without redundancy or over-explanation
- **Single source of truth**: Avoid duplicating the same information in multiple sections
- **Check for duplication**: Before adding new content, verify it doesn't already exist elsewhere in the document
- **Consolidate, don't duplicate**: If similar information exists, enhance the existing section rather than creating a new one

### **🎯 Workflow Discipline**

- **Read README first**: Always review this file when starting new tasks or optimizing context
- **Refresh after context optimization**: After reducing/optimizing context, immediately re-read this README to restore full knowledge
- **Follow established conventions**: Apply all documented patterns without needing reminders
- **Context awareness**: Understand the full architecture before making changes
- **Consistency over convenience**: Maintain established patterns even when alternatives seem simpler

### **📋 Decision Documentation**

- **Document reasoning**: When making architectural decisions, briefly explain WHY in appropriate sections
- **Update examples**: Keep code examples current with actual implementation
- **Note breaking changes**: When patterns evolve, update guidelines and mark deprecated approaches
- **Cross-reference consistency**: Ensure naming, structure, and patterns align across all sections

### **🔄 Quality Assurance**

- **Full verification**: Always run both `npm run lint` AND `npm run build:app` before task completion
- **Pattern compliance**: Verify new code follows documented conventions (naming, structure, comments)
- **No regression**: Don't introduce patterns that contradict established guidelines
- **Proactive improvement**: Suggest documentation updates when gaps or inconsistencies are discovered

### **⚖️ Development Philosophy**

- **Progressive enhancement**: Understand existing code first, then improve incrementally
- **Minimal viable changes**: For NEW features - minimal necessary changes only
- **Comprehensive refactoring**: For REFACTORING - inspect all related connections, used/using dependencies
- **Impact awareness**: Understand how changes affect other parts of the system
- **Technical debt tracking**: Document discovered issues for future resolution

### **🤝 Communication & Decision Making**

- **Ask when uncertain**: If anything is unclear or ambiguous, ask questions before proceeding
- **Research complex cases**: For challenging problems, research world-class best practices first
- **Discuss before major changes**: Always discuss significant architectural or pattern changes before implementation
- **Explain reasoning**: When proposing solutions, explain the WHY behind the approach
- **Suggest alternatives**: When multiple valid approaches exist, present options with trade-offs

---

_Last updated: September 2025_
