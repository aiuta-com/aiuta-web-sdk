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

### **Component Naming**

- **Files**: `PascalCase` (e.g., `ErrorSnackbar.tsx`)
- **Directories**: `PascalCase` (e.g., `ErrorSnackbar/`)
- **Exports**: Named exports preferred, default for pages

### **State Management (Redux)**

- **Location**: `src/store/`
- **Architecture**: Domain-driven slices
- **Structure**: `store/slices/{domain}Slice/{domain}Slice.ts`, `selectors.ts`, `index.ts`
- **Domain separation**:
  - `apiSlice` - API configuration (`apiKey`, `subscriptionId`)
  - `appSlice` - App state (`isMobile`, `isLoading`, `hasFooter`, `isInitialized`)
  - `tryOnSlice` - Try-on process (`isGenerating`, `currentImage`, `productId`, `operationId`)
  - `qrSlice` - QR functionality (`token`, `isLoading`)
  - `onboardingSlice` - Onboarding flow (`currentStep`, `isCompleted`)
  - `uploadsSlice` - Image uploads (`inputImages`, `isSelecting`, `isBottomSheetOpen`)
  - `generationsSlice` - Generated images (`generatedImages`, `selectedImages`, `isSelecting`)
  - `errorSnackbarSlice` - Error display (`isVisible`, `errorMessage`, `retryButtonText`)
- **Actions**: Descriptive verbs (e.g., `setIsGenerating`, `setCurrentImage`)
- **Selectors**: Atomic and domain-specific (e.g., `apiKeySelector`, `productIdSelector`)

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

### **Page Structure**

- **PhotoUploadPage**: QR/device upload (Desktop: QR, Mobile: direct)
- **TryOnPage**: Main try-on interface (Desktop/Mobile variants)
- **ResultsPage**: Generated results with sharing
- **UploadsHistoryPage**: User uploaded photos gallery
- **GenerationsHistoryPage**: Generated images gallery

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

- **Component**: `ErrorSnackbar` - bottom toast with retry functionality
- **Pattern**: Dispatch `showErrorSnackbar({ errorMessage, retryButtonText })` in hooks
- **UI**: ErrorSnackbar component handles display and retry functionality
- **Redux**: `errorSnackbarSlice` → `errorSnackbarSelector`, `isErrorSnackbarVisibleSelector`
- **State**: `{ isVisible, errorMessage, retryButtonText }`
- **Actions**: `showErrorSnackbar()`, `hideErrorSnackbar()`
- **Analytics**: Track errors via analytics services
- **Hide**: Use `hideErrorSnackbar()` to programmatically hide

### **Image Handling**

- **Upload flow**: `useImageUpload` → `usePhotoGallery` → Redux store
- **QR flow**: `useQrUpload` (Desktop) + `useQrToken` (Mobile)
- **Generation**: `useTryOnGeneration` → polling → results

## 🎨 **CSS & Styling**

### **CSS Modules & BEM**

- **Auto-generation**: `generateScopedName` creates BEM from camelCase SCSS
- **Key rules**:
  - **Block**: `.componentName` → `aiuta-component-name`
  - **Element**: `.elementName` → `aiuta-component-name__element-name`
  - **Modifier**: `.componentNameModifier` → `aiuta-component-name--modifier`
- **⚠️ Naming conventions**:
  - **✅ DO**: Simple element names (`.content`, `.button`, `.path`)
  - **❌ DON'T**: Prefix elements (`.componentNameContent` ❌)
  - **✅ DO**: camelCase in SCSS, kebab-case generated in CSS

**Quick example:**

```scss
// MyComponent.module.scss
.myComponent {
} // → aiuta-my-component
.myComponentActive {
} // → aiuta-my-component--active
.title {
} // → aiuta-my-component__title
.titleBold {
} // → aiuta-my-component__title--bold
```

### **Responsive Design**

- **Desktop/Mobile**: Separate components when UI differs significantly
- **Shared logic**: Extract to custom hooks
- **Breakpoints**: Handled via CSS, not JS

## 🔧 **Development Guidelines**

- **File organization**: Co-locate related files, use `index.ts` exports
- **Hook design**: Single responsibility, handle errors via ErrorSnackbar
- **Performance**: Lazy loading for routes, `useCallback`/`useMemo` for expensive ops
- **Build tool**: Vite with SCSS modules and BEM naming

## 📝 **TODO Priorities**

1. Add selectionSnackbar for bulk actions
2. Optimize bundle size and loading
3. Enhance analytics tracking
4. Improve error boundaries and fallbacks

## 📖 **Documentation Policy**

**⚠️ IMPORTANT**: This README.md is the **ONLY** documentation file for the **app development**.

- **🎯 Scope**: Internal development documentation for the iframe application
- **📚 SDK Documentation**: Complete SDK documentation available at [docs.aiuta.com](https://docs.aiuta.com/sdk/web/)
- **✅ DO**: Update this file when architecture or practices change
- **❌ DON'T**: Create additional docs/\*.md files for app development
- **📝 Rule**: All app development documentation must be consolidated here for easy maintenance and AI context restoration

---

## 🔍 **Quick Reference**

### **Common Patterns**

```typescript
// Error handling pattern
const dispatch = useAppDispatch()
dispatch(errorSnackbarSlice.actions.showErrorSnackbar({
  errorMessage: 'Upload failed. Please try again.',
  retryButtonText: 'Try again'
}))

// CSS usage
<div className={`${styles.component} ${active ? styles.componentActive : ''}`}>
  <div className={styles.content}>Content</div>
</div>
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
