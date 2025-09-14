# Aiuta Iframe Application

## Architecture Overview

### 🏗️ **Core Structure**

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **React Router** (MemoryRouter) for navigation
- **CSS Modules** with BEM methodology
- **RPC communication** with parent SDK (replacing legacy postMessage)

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

### **CSS & Styling**

- **CSS Modules**: `Component.module.scss`
- **BEM methodology**: Automatic generation via `generateScopedName`
- **Generated classes**:
  - **Main block**: `aiuta-{component-name}` (e.g., `aiuta-error-snackbar`)
  - **Elements**: `aiuta-{component-name}__{element}` (e.g., `aiuta-error-snackbar__content`)
  - **Modifiers**: `aiuta-{component-name}--{modifier}` (e.g., `aiuta-error-snackbar--active`)
  - **Element modifiers**: `aiuta-{component-name}__{element}--{modifier}`
- **SCSS naming**: `camelCase` for all classes (e.g., `.errorSnackbar`, `.content`, `.errorSnackbarActive`)
- **JS access**: `camelCase` properties (e.g., `styles.errorSnackbar`, `styles.content`)

### **State Management (Redux)**

- **Location**: `src/store/` (NOT lib/redux - app-specific state)
- **Architecture**: Domain-driven slices (migrated from monolithic `configSlice`)
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
/results/:id → ResultsPage
/uploads-history → UploadsHistoryPage
/generations-history → GenerationsHistoryPage
```

## 🔄 **Communication & Data Flow**

### **RPC Integration**

- **Context**: `RpcProvider` wraps both main app and modal-only app
- **Methods**: `rpc.sdk.{method}()` for SDK communication
- **Modal communication**: Modal-only iframes use `rpc.sdk.closeModal()` to close themselves
- **Legacy**: TODO comments mark postMessage replacements being migrated

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

## 🎨 **Styling Guidelines**

### **CSS Modules Configuration**

- **Auto-generation**: `generateScopedName` creates proper BEM from camelCase
- **Component matching**: Class name = component name → main block (no element)
- **Modifier detection**: `{base}{Modifier}` → `{base}--{modifier}`
- **Examples**:

  **SCSS (camelCase naming):**

  ```scss
  // ErrorSnackbar.module.scss
  .errorSnackbar {
    // → aiuta-error-snackbar (main block)
    display: flex;
  }

  .errorSnackbarError {
    // → aiuta-error-snackbar--error (modifier)
    background: red;
  }

  .errorSnackbarActive {
    // → aiuta-error-snackbar--active (modifier)
    bottom: 15px;
  }

  .content {
    // → aiuta-error-snackbar__content (element)
    padding: 16px;
  }

  .contentFullWidth {
    // → aiuta-error-snackbar__content--full-width (element modifier)
    width: 100%;
  }
  ```

  **TypeScript (camelCase access):**

  ```typescript
  // Component usage
  <div className={`${styles.errorSnackbar} ${isError ? styles.errorSnackbarError : ''}`}>
    <div className={`${styles.content} ${fullWidth ? styles.contentFullWidth : ''}`}>
      Content here
    </div>
  </div>
  ```

  **Generated CSS (kebab-case BEM):**

  ```css
  .aiuta-error-snackbar {
    display: flex;
  }
  .aiuta-error-snackbar--error {
    background: red;
  }
  .aiuta-error-snackbar--active {
    bottom: 15px;
  }
  .aiuta-error-snackbar__content {
    padding: 16px;
  }
  .aiuta-error-snackbar__content--full-width {
    width: 100%;
  }
  ```

### **Responsive Design**

- **Desktop/Mobile**: Separate components when UI differs significantly
- **Shared logic**: Extract to custom hooks
- **Breakpoints**: Handled via CSS, not JS

## 🔧 **Development Guidelines**

### **File Organization**

- **Co-location**: Keep related files together
- **Index exports**: Use `index.ts` for clean imports
- **Types**: Separate `.ts` files for complex interfaces

### **Hook Design**

- **Single responsibility**: One hook, one concern
- **Composition**: Combine hooks in components, not in other hooks
- **Error boundaries**: Handle errors within hooks, dispatch to ErrorSnackbar

### **Performance**

- **Lazy loading**: Dynamic imports for routes
- **Memoization**: `useCallback`/`useMemo` for expensive operations
- **Image optimization**: Object URLs, proper cleanup

## 🚀 **Build & Deployment**

### **Environment**

- **Build tool**: Vite
- **CSS processing**: SCSS modules with BEM naming
- **Bundle analysis**: Check `dist/app/` output

### **Integration**

- **SDK embedding**: Via `sdk/iframe.ts`
- **Cross-origin**: Handles iframe security and communication
- **Modal modes**: Support overlay and full-page modes

## 📝 **Migration Notes**

### **Recent Changes**

- ✅ **Alert → ErrorSnackbar**: Proper semantic naming and improved API
- ✅ **ErrorSnackbar Redux**: Simplified with `showErrorSnackbar()` / `hideErrorSnackbar()`
- ✅ **BEM CSS**: Automatic generation with `generateScopedName`
- ✅ **CSS naming**: `camelCase` in SCSS → `kebab-case` BEM in CSS
- ✅ **Main block optimization**: Component name = main block (no element duplication)
- ✅ **Modifier detection**: Automatic `--` for modifiers, `__` for elements
- ✅ **RPC transition**: Replacing postMessage system
- ✅ **Hook organization**: Domain-based grouping
- ✅ **Redux cleanup**: Specific slice naming and improved state structure
- ✅ **Redux location**: Moved from `lib/redux` to `src/store` (app-specific state)
- ✅ **Modal URL simplification**: Unified `?modal=share|fullscreen` instead of separate `modal` + `modalType` params
- ✅ **Modal RPC integration**: Both main and modal-only apps wrapped in RpcProvider
- ✅ **App mode separation**: Clear distinction between main app iframe and modal-only iframe
- ✅ **Redux architecture refactor**: Broke down monolithic `configSlice` into 8 domain-specific slices
- ✅ **State flattening**: Removed unnecessary nesting (e.g., `apiSlice.endpointData` → `apiSlice`)
- ✅ **Field renaming**: `userId` → `subscriptionId`, `skuId` → `productId` for consistency
- ✅ **JWT authentication**: Fixed API compatibility for subscription-based auth
- ✅ **Logger integration**: Unified logging across SDK and app with proper configuration

### **TODO Priorities**

1. Complete RPC migration (remove legacy postMessage)
2. Add selectionSnackbar for bulk actions
3. Optimize bundle size and loading
4. Enhance analytics tracking
5. Improve error boundaries and fallbacks

## 📖 **Documentation Policy**

**⚠️ IMPORTANT**: This README.md is the **ONLY** documentation file for the app.

- **✅ DO**: Update this file when architecture or practices change
- **❌ DON'T**: Create additional docs/\*.md files
- **❌ DON'T**: Create separate documentation files elsewhere
- **📝 Rule**: All app documentation must be consolidated here for easy maintenance and AI context restoration

---

## 🔍 **Quick Reference**

### **Common Patterns**

```typescript
// Hook with error handling
const { upload } = useImageUpload()
const dispatch = useAppDispatch()

const handleUpload = async (file: File) => {
  try {
    await upload(file)
  } catch (error) {
    dispatch(errorSnackbarSlice.actions.showErrorSnackbar({
      errorMessage: 'Upload failed. Please try again.',
      retryButtonText: 'Try again'
    }))
  }
}

// CSS Modules (camelCase naming)
.photoUpload {              // → aiuta-photo-upload (main block)
  display: flex;
}

.photoUploadLoading {       // → aiuta-photo-upload--loading (modifier)
  opacity: 0.7;
}

.container {                // → aiuta-photo-upload__container (element)
  width: 100%;
}

.button {                   // → aiuta-photo-upload__button (element)
  padding: 12px;
}

.buttonPrimary {            // → aiuta-photo-upload__button--primary (element modifier)
  background: blue;
}
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
