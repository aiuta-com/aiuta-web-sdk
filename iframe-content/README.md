# Aiuta Iframe Application

## Architecture Overview

### 🏗️ **Core Structure**

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** (MemoryRouter) for navigation
- **CSS Modules** with BEM methodology
- **RPC communication** with parent SDK (replacing legacy postMessage)

### 📁 **Directory Structure**

```
src/
├── components/           # Reusable UI components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── store/               # Redux store and slices
├── utils/               # Utilities and services
├── contexts/            # React contexts
└── styles/              # Global styles
```

## 🎯 **Key Practices & Conventions**

### **Component Naming**

- **Files**: `PascalCase` (e.g., `ErrorSnackbar.tsx`)
- **Directories**: `PascalCase` (e.g., `ErrorSnackbar/`)
- **Exports**: Named exports preferred, default for pages

### **CSS & Styling**

- **CSS Modules**: `Component.module.scss`
- **BEM methodology**: `.block`, `.block__element`, `.block--modifier`
- **Generated classes**: `aiuta-{component-name}__{element}--{modifier}`
- **Naming**: `kebab-case` for CSS, `camelCase` for JS properties

### **State Management (Redux)**

- **Location**: `src/store/` (NOT lib/redux - app-specific state)
- **Slice naming**: Descriptive and specific (e.g., `errorSnackbarSlice`)
- **Structure**: `store/slices/{domain}Slice/{domain}Slice.ts`, `selectors.ts`, `index.ts`
- **Actions**: Descriptive verbs (e.g., `setShowErrorSnackbar`)
- **Selectors**: Named consistently (e.g., `show{Domain}StatesSelector`)

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

### **ErrorSnackbar**

- Bottom toast for error messages with retry functionality
- Redux: `errorSnackbarSlice` → `showErrorSnackbarStatesSelector`
- Used across all pages for consistent error handling

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

- **Context**: `RpcProvider` with `useRpcProxy`
- **Methods**: `rpc.sdk.{method}()` for SDK communication
- **Legacy**: TODO comments mark postMessage replacements

### **Error Handling**

- **Pattern**: Dispatch `setShowErrorSnackbar` in hooks
- **UI**: ErrorSnackbar component handles display
- **Analytics**: Track errors via analytics services

### **Image Handling**

- **Upload flow**: `useImageUpload` → `usePhotoGallery` → Redux store
- **QR flow**: `useQrUpload` (Desktop) + `useQrToken` (Mobile)
- **Generation**: `useTryOnGeneration` → polling → results

## 🎨 **Styling Guidelines**

### **CSS Modules Configuration**

- **Generated names**: `aiuta-{component}__{element}--{modifier}`
- **BEM structure**: Block → Element → Modifier
- **Example**:
  ```scss
  .snackbar {
    &--error {
      background: red;
    }
    &__content {
      padding: 16px;
    }
    &__button {
      margin-left: auto;
    }
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
- **Bundle analysis**: Check `dist/iframe/` output

### **Integration**

- **SDK embedding**: Via `web-sdk/iframe.ts`
- **Cross-origin**: Handles iframe security and communication
- **Modal modes**: Support overlay and full-page modes

## 📝 **Migration Notes**

### **Recent Changes**

- ✅ **Alert → ErrorSnackbar**: Proper semantic naming
- ✅ **BEM CSS**: Consistent methodology with namespace
- ✅ **RPC transition**: Replacing postMessage system
- ✅ **Hook organization**: Domain-based grouping
- ✅ **Redux cleanup**: Specific slice naming
- ✅ **Redux location**: Moved from `lib/redux` to `src/store` (app-specific state)

### **TODO Priorities**

1. Complete RPC migration (remove legacy postMessage)
2. Add selectionSnackbar for bulk actions
3. Optimize bundle size and loading
4. Enhance analytics tracking
5. Improve error boundaries and fallbacks

## 📖 **Documentation Policy**

**⚠️ IMPORTANT**: This README.md is the **ONLY** documentation file for iframe-content.

- **✅ DO**: Update this file when architecture or practices change
- **❌ DON'T**: Create additional docs/\*.md files
- **❌ DON'T**: Create separate documentation files elsewhere
- **📝 Rule**: All iframe-content documentation must be consolidated here for easy maintenance and AI context restoration

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
    dispatch(errorSnackbarSlice.actions.setShowErrorSnackbar({
      type: 'error',
      isShow: true,
      buttonText: 'Try again',
      content: 'Upload failed'
    }))
  }
}

// BEM CSS
.photo-upload {
  &--loading { opacity: 0.7; }
  &__container { width: 100%; }
  &__button {
    &--primary { background: blue; }
  }
}
```

### **State Access**

```typescript
// Redux selectors (from src/store)
const errorState = useAppSelector(showErrorSnackbarStatesSelector)
const config = useAppSelector(aiutaEndpointDataSelector)

// RPC context
const { rpc } = useRpcProxy()
await rpc.sdk.openModal({ type: 'share', data: imageUrl })
```

_Last updated: September 2025_
