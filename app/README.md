# Aiuta Iframe Application

## Architecture Overview

### 🏗️ **Core Structure**

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **React Router** (MemoryRouter) for navigation
- **CSS Modules** with BEM methodology
- **RPC communication** with parent SDK

### 📁 **Directory Structure**

```
app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux store and slices
│   ├── utils/           # Utilities and services
│   ├── contexts/        # React contexts
│   └── styles/          # Global styles
├── public/              # Static assets
└── index.html          # HTML entry point
```

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

### **Performance Patterns**

#### **Memoization Guidelines**

- **React.memo**: For components with stable props that re-render frequently
- **useMemo**: For expensive calculations, complex object creation
- **useCallback**: For event handlers passed to memoized children
- **Avoid premature optimization**: Profile first, optimize based on data

#### **Bundle Optimization**

- **Lazy loading**: Route-level code splitting with `React.lazy`
- **Dynamic imports**: Load heavy libraries on demand
- **Image optimization**: WebP format, appropriate sizes, lazy loading
- **Bundle analysis**: Regular checks for unnecessary dependencies

#### **Render Optimization**

- **Avoid inline objects**: Extract stable references outside render
- **Minimize context value changes**: Split contexts by update frequency
- **List optimization**: Stable keys, windowing for large lists
- **Debouncing**: For rapid user input (search, form validation)

### **TypeScript Patterns**

#### **Type Organization**

- **Co-located types**: Keep types near their usage (`Component.types.ts`)
- **Shared types**: Global types in `src/types/` for cross-domain usage
- **Export patterns**: `export type { }` for type-only exports
- **Generic constraints**: Use `extends` for meaningful constraints

#### **Utility Types Usage**

- **Props derivation**: `Pick<BaseProps, 'field1' | 'field2'>` for variants
- **Partial updates**: `Partial<State>` for update functions
- **Required fields**: `Required<Props>` when defaults are applied
- **Conditional types**: For complex prop relationships

#### **Strict Mode Guidelines**

- **No implicit any**: All values must have explicit types
- **Strict null checks**: Handle `null` and `undefined` explicitly
- **No unused locals**: Clean up unused variables and imports
- **Exact types**: Use discriminated unions for state variants

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

## 📱 **Key Components**

### **Image Components**

- **SelectableImage**: Universal image with selection support
  - CSS class: `.selectableImage`, `.selectableImageActive`
  - Works with both `generationsSlice` and `uploadsSlice` via `galleryType` prop
  - Shows checkmark for selection, supports hover states

- **DeletableImage**: Image with individual delete button
  - CSS class: `.deletableImage`
  - Shows trash icon for individual deletion
  - Used primarily on mobile for uploads gallery

- **ImageGallery**: Universal gallery component
  - **Logic**: Shows `SelectableImage` for:
    1. Generated images (always)
    2. When selection mode is enabled (any variant)
    3. Uploaded images on desktop (no individual delete buttons)
  - **Mobile uploads**: Shows `DeletableImage` for individual deletion
  - **Desktop uploads**: Shows `SelectableImage` only, deletion via SelectionSnackbar

### **Button Components**

- **TryOnButton**: Specialized for actual "Try On" actions only
  - CSS class: `.tryOnButton`
  - No disabled state (always actionable)
  - Icon support via `isShowTryOnIcon` prop

- **PrimaryButton**: Universal primary action button
  - CSS class: `.primaryButton`, `.primaryButtonDisabled`
  - Supports disabled state for forms/workflows
  - Icon support via `iconUrl` prop

- **SecondaryButton**: Secondary/alternative actions
  - CSS class: `.secondaryButton`
  - Neutral styling, icon support

### **Page Structure**

- **PhotoUploadPage**: QR/device upload (Desktop: QR, Mobile: direct)
- **TryOnPage**: Main try-on interface (Desktop/Mobile variants)
- **ResultsPage**: Generated results with sharing
- **UploadsHistoryPage**: User uploaded photos gallery (Desktop: SelectableImage only, Mobile: DeletableImage + SelectableImage)
- **GenerationsHistoryPage**: Generated images gallery (SelectableImage with selection mode)

### **Routing**

```
/ → Home
/qr → PhotoUploadPage (Desktop)
/qr/:token → PhotoUploadPage (Mobile)
/view → TryOnPage
/results → ResultsPage
/uploads-history → UploadsHistoryPage
/generations-history → GenerationsHistoryPage
```

## 🔄 **Communication & Data Flow**

### **RPC Integration**

- **Context**: `RpcProvider` wraps both main app and modal-only app
- **Methods**: `rpc.sdk.{method}()` for SDK communication
- **Modal communication**: Modal-only iframes use `rpc.sdk.closeModal()` to close themselves

### **Error Handling**

- **Pattern**: `dispatch(showErrorSnackbar({ errorMessage, retryButtonText }))` → `ErrorSnackbar` component
- **State**: `{ isVisible, error: string | null }` with user-friendly messages
- **Boundaries**: Component-level error boundaries with fallback UI (TODO: implement after refactoring)

### **Image Handling**

- **Upload flow**: `useImageUpload` → `usePhotoGallery` → Redux store
- **QR flow**: `useQrUpload` (Desktop) + `useQrToken` (Mobile)
- **Generation**: `useTryOnGeneration` → polling → results

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

## 🔧 **Development Guidelines**

- **File organization**: Co-locate related files, use `index.ts` exports
- **Hook design**: Single responsibility, handle errors via ErrorSnackbar
- **Performance**: Lazy loading for routes, `useCallback`/`useMemo` for expensive ops
- **Build tool**: Vite with SCSS modules and BEM naming
- **Comments**: All code comments must be in English only
- **Comment quality**: Avoid obvious comments; explain WHY, not WHAT. Use only for complex logic or business rules
- **Naming consistency**: Use slice-aligned terminology (`generated`/`uploaded` not `history`/`previously`)
- **Descriptive naming**: Names should clearly indicate purpose, responsibility, and data type
- **Avoid abbreviations**: Use full words (`selectedImages` not `selImgs`, `isGenerating` not `isGen`)
- **Single Responsibility**: Split components by responsibility (e.g., `SelectableImage` vs `DeletableImage`)
- **Domain alignment**: Ensure terminology matches Redux slices and business logic

## 📝 **TODO Priorities**

1. Add selectionSnackbar for bulk actions
2. Optimize bundle size and loading
3. Enhance analytics tracking
4. Improve error boundaries and fallbacks

## 🔧 **Technical Debt & Issues**

**🎯 Purpose**: Track discovered inconsistencies and improvement opportunities during refactoring.

### **Found During Refactoring** (Update this section as issues are discovered)

**⚠️ IMPORTANT**: Remove items from this list when they are fixed. This should contain only UNRESOLVED issues.

- [ ] **Example**: Inconsistent error handling patterns

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

## 🔍 **Quick Reference**

### **Common Patterns**

```typescript
// Error handling
    dispatch(errorSnackbarSlice.actions.showErrorSnackbar({
      errorMessage: 'Upload failed. Please try again.',
      retryButtonText: 'Try again'
    }))

// Naming - descriptive and clear
const selectedImages = useAppSelector(selectedImagesSelector)  // ✅ Clear purpose
const handleImageClick = (image: ImageItem) => { }           // ✅ Event handler
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024                      // ✅ Constant

// Performance
const Component = React.memo(({ data, onUpdate }) => {
  const processed = useMemo(() => expensiveCalc(data), [data])
  const handleUpdate = useCallback((id) => onUpdate(id), [onUpdate])
  return <div>{processed}</div>
})

// TypeScript
type Props = Pick<BaseProps, 'isOpen'> & { onConfirm: () => void }
interface State { byId: Record<string, T>; allIds: string[]; isLoading: boolean }
```

### **State Access**

```typescript
// Redux selectors (from src/store) - domain-specific atomic selectors
const { isVisible, errorMessage, retryButtonText } = useAppSelector(errorSnackbarSelector)
const apiKey = useAppSelector(apiKeySelector)
const subscriptionId = useAppSelector(subscriptionIdSelector)
const productId = useAppSelector(productIdSelector)
const isGenerating = useAppSelector(tryOnIsGeneratingSelector)
const isMobile = useAppSelector(isMobileSelector)

// Error snackbar actions
dispatch(
  errorSnackbarSlice.actions.showErrorSnackbar({
    errorMessage: 'Something went wrong',
    retryButtonText: 'Try again',
  }),
)
dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())

// RPC context
const { rpc } = useRpcProxy()
await rpc.sdk.openModal({ type: 'share', data: imageUrl })
```

_Last updated: September 2025_
