# Aiuta RPC System

Modern RPC communication system for secure interaction between Web SDK and iframe Application.

## 📁 Architecture

```
shared/rpc/
├── index.ts        # 🎯 Main public API entry point
├── core.ts         # ⚡ Core RPC protocol types & constants
├── api-sdk.ts      # 🌐 SDK API contracts (App → SDK)
├── api-app.ts      # 📱 App API contracts (SDK → App)
├── base.ts         # 🏗️ Base class & internal types
├── utils.ts        # 🔧 Utility functions
├── generic.ts      # ⚙️ Generic RPC client/server logic
├── rpc-sdk.ts      # 🌐 AiutaRpcSdk implementation
└── rpc-app.ts      # 📱 AiutaRpcApp implementation
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
  },
})

// Basic connection
await rpc.connect(iframe)
await rpc.app.tryOn('product-123')

// Multi-iframe support
await rpc.connect(mainIframe)
await rpc.connect(modalIframe, { connectionId: 'modal' })
await rpc.connection('modal').api.showModal({ imageUrl: 'url' })
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
```

## 📋 API Contracts

### SDK API (what App can call on SDK)

```typescript
interface SdkApi {
  getConfigurationSnapshot(): Promise<{ data: Record<string, unknown>; functionKeys: string[] }>
  invokeConfigFunction(path: string, ...args: any[]): Promise<any>
  trackEvent(event: Record<string, unknown>): Promise<void>
  getCapabilities(): Promise<SdkCapabilities>
}

type SdkHandlers = {
  trackEvent?: (
    event: Record<string, unknown>,
    ctx: { appVersion?: string },
  ) => void | Promise<void>
}

interface SdkContext {
  cfg: Record<string, unknown>
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

## 🔧 Multi-iframe Support

```typescript
const rpc = new AiutaRpcSdk({ context, handlers })

// Connect multiple iframes
await rpc.connect(mainIframe) // default connection
await rpc.connect(modalIframe, { connectionId: 'modal' }) // named connection
await rpc.connect(helpIframe, { connectionId: 'help' }) // another connection

// Use specific connections
await rpc.connection('modal').api.showModal({ data })
await rpc.connection('help').api.showHelp({ topic: 'sizing' })

// Manage connections
console.log(rpc.getConnections()) // ['default', 'modal', 'help']
rpc.disconnect('modal')
rpc.close() // close all connections
```

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

For custom implementations or debugging:

```typescript
// Direct module imports
import { AiutaRpcSdk } from '@lib/rpc/rpc-sdk'
import type { RpcReq, RpcRes } from '@lib/rpc/core'
import { createRpcClient } from '@lib/rpc/generic'
import { AiutaRpcBase, type ConnectionInfo } from '@lib/rpc/base'

// Custom RPC implementation
class CustomRpcSdk extends AiutaRpcSdk {
  async handleCustomProtocol(req: RpcReq): Promise<RpcRes> {
    // custom logic
  }
}
```

## 🎯 Design Principles

- **Clean Public API** - Only essential types exported from main entry point
- **Modular Architecture** - Each file has single responsibility
- **Type Safety** - Full TypeScript support with strict contracts
- **Security First** - Origin validation and secure communication
- **Developer Experience** - Simple API for common cases, powerful for advanced usage

## 📦 Bundle Optimization

The modular design enables optimal tree-shaking:

```typescript
// Only import what you need
import type { SdkApi } from '@lib/rpc/api-sdk' // ~1KB
import type { AppApi } from '@lib/rpc/api-app' // ~0.5KB
import type { RpcReq } from '@lib/rpc/core' // ~0.3KB

// No unnecessary internal types in your bundle
```

## 🚀 Production Ready

- ✅ **Security** - Protection against all known vulnerabilities
- ✅ **Performance** - Optimized MessagePort communication
- ✅ **Reliability** - Proper error handling and cleanup
- ✅ **Scalability** - Multi-iframe support with connection management
- ✅ **Maintainability** - Clean modular architecture
- ✅ **Documentation** - Complete API contracts and examples
