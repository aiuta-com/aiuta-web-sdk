# Aiuta RPC System

RPC communication system for interaction between Web SDK and single iframe Application.

## 📁 Architecture

```
lib/rpc/
├── index.ts              # 🎯 Main public API entry point
│
├── protocol/             # ⚡ Core RPC protocol
│   ├── index.ts         # Re-exports
│   ├── core.ts          # Protocol types & constants
│   ├── transport.ts     # MessagePort client/server logic
│   └── utils.ts         # Utility functions
│
├── api/                 # 📋 API interfaces
│   ├── index.ts         # Re-exports
│   ├── sdk.ts           # SDK API contracts (App → SDK)
│   └── app.ts           # App API contracts (SDK → App)
│
├── clients/             # 🏢 RPC implementations
│   ├── index.ts         # Re-exports
│   ├── sdk.ts           # AiutaRpcSdk implementation
│   └── app.ts           # AiutaRpcApp implementation
│
└── shared/              # 🔧 Shared utilities
    ├── index.ts         # Re-exports
    └── base.ts          # Base class & common types
```

## 🚀 Quick Start

### Basic Usage (95% of cases)

```typescript
import { AiutaRpcSdk, AiutaRpcApp } from '@lib/rpc'
import type { SdkApi, AppApi } from '@lib/rpc'
```

### SDK Side (web-sdk)

```typescript
import { AiutaRpcSdk } from '@lib/rpc'

const rpc = new AiutaRpcSdk({
  context: { cfg: config, sdkVersion: '1.0.0' },
  handlers: {
    trackEvent: (event) => analytics.track(event),
    setInteractive: (interactive) => iframe.setInteractive(interactive),
  },
})

// Connect to single iframe
await rpc.connect(iframe)
await rpc.app.tryOn('product-123')
```

### App Side (iframe-content)

```typescript
import { AiutaRpcApp } from '@lib/rpc'

const rpc = new AiutaRpcApp({
  context: { appVersion: '1.0.0' },
  handlers: {
    tryOn: async (productId) => handleTryOn(productId),
  },
})

await rpc.connect()

// Direct config function calls (proxied)
const token = await rpc.config.auth.getToken?.({ imageId: '123' })
const userId = rpc.config.auth.getUserId?.()

// Direct SDK calls
await rpc.sdk.trackEvent({ action: 'try_on_started' })
await rpc.sdk.setInteractive(false) // Make iframe click-through
```

## 📋 API Contracts

### SDK API (what App can call on SDK)

```typescript
interface SdkApi {
  getConfigurationSnapshot(): Promise<{ data: Record<string, unknown>; functionKeys: string[] }>
  invokeConfigFunction(path: string, ...args: any[]): Promise<any>
  trackEvent(event: Record<string, unknown>): Promise<void>
  setInteractive(interactive: boolean): Promise<void>
  getCapabilities(): Promise<SdkCapabilities>
}

type SdkHandlers = {
  trackEvent?: (
    event: Record<string, unknown>,
    ctx: { appVersion?: string },
  ) => void | Promise<void>
  setInteractive?: (interactive: boolean) => void | Promise<void>
}

interface SdkContext<TConfig = Record<string, unknown>> {
  cfg: TConfig
  sdkVersion: string
}
```

### App API (what SDK can call on App)

```typescript
interface AppApi {
  tryOn(productId: string): Promise<void>
}

type AppHandlers = {
  tryOn: (productId: string) => Promise<void> | void
}

interface AppContext {
  appVersion: string
}
```

## 🛡️ Security Features

- **Origin validation** - secure parent/iframe communication
- **Handshake protocol** - two-step origin verification
- **Timeout protection** - prevents hanging connections
- **Safe serialization** - proper error handling for message data
- **URL-based origin passing** - secure origin transmission via iframe URL

## 🖼️ Single Iframe Architecture

The RPC system now supports a **single fullscreen iframe** approach:

```typescript
const rpc = new AiutaRpcSdk({ context, handlers })

// Connect to single iframe that handles everything
await rpc.connect(mainIframe)

// App controls its own visibility and modals
await rpc.app.tryOn('product-123') // Shows app
// App calls rpc.sdk.setInteractive(false) when showing modals
// App calls rpc.sdk.setInteractive(true) when modals close
```

### Iframe Interactivity Control

The App can control iframe interactivity for click-through behavior:

```typescript
// In App: Make iframe non-interactive (click-through)
await rpc.sdk.setInteractive(false)

// In App: Make iframe interactive again
await rpc.sdk.setInteractive(true)
```

This enables the App to handle fullscreen galleries and modals internally while controlling whether clicks pass through to the parent page.

## ⚡ Config Proxying

The RPC system automatically proxies configuration functions, allowing direct calls:

```typescript
// Instead of manual RPC calls
const token = await rpc.sdk.invokeConfigFunction('auth.getToken', { imageId: '123' })

// You can call functions directly (they're proxied automatically)
const token = await rpc.config.auth.getToken?.({ imageId: '123' })
const userId = rpc.config.auth.getUserId?.()
```

This works through automatic function path extraction and proxy setup during handshake.

## 🔄 Migration from PostMessage

### Before (PostMessage)

```typescript
SecureMessenger.sendToParent({ action: 'GET_JWT_TOKEN', imageId: '123' })
window.addEventListener('message', (event) => {
  if (event.data.type === 'JWT_TOKEN') {
    const token = event.data.jwtToken
  }
})
```

### After (RPC)

```typescript
const token = await rpc.config.auth.getToken?.({ imageId: '123' })
```

## 🧪 Advanced Usage

For custom implementations:

```typescript
// Extend public classes for custom behavior
import { AiutaRpcSdk, AiutaRpcApp } from '@lib/rpc'

class CustomRpcSdk extends AiutaRpcSdk {
  // Override or extend public methods
  async connect(iframe: HTMLIFrameElement) {
    // custom connection logic
    return super.connect(iframe)
  }
}
```

## 🎯 Design Principles

- **Clean Public API** - Only essential types exported from main entry point
- **Modular Architecture** - Organized into logical directories by purpose
- **Type Safety** - Full TypeScript support with strict contracts
- **Security First** - Origin validation and secure communication
- **Single Iframe Focus** - Optimized for modern single iframe architecture
- **Developer Experience** - Simple API for common cases, powerful for advanced usage

## 📦 Bundle Optimization

The modular design enables optimal tree-shaking:

```typescript
// Only import what you need - clean public API
import { AiutaRpcSdk, AiutaRpcApp } from '@lib/rpc'
import type { SdkApi, AppApi } from '@lib/rpc'

// No unnecessary internal types in your bundle
```

## 🚀 Production Ready

- ✅ **Security** - Protection against all known vulnerabilities
- ✅ **Performance** - Optimized MessagePort communication
- ✅ **Reliability** - Proper error handling and cleanup
- ✅ **Single Iframe** - Simplified architecture with fullscreen iframe
- ✅ **Maintainability** - Clean modular directory structure
- ✅ **Documentation** - Complete API contracts and examples
