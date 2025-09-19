# Aiuta RPC System

RPC communication system for interaction between Web SDK and single iframe Application.

## 📁 Architecture

### 🏗️ File Structure

```
lib/rpc/
├── index.ts              # 🎯 Main public API entry point
│
├── api/                 # 📋 Public API interfaces
│   ├── sdk.ts           # SDK API contracts (App → SDK)
│   └── app.ts           # App API contracts (SDK → App)
│
├── clients/             # 🏢 RPC implementations
│   ├── base.ts          # Base class & common types
│   ├── sdk.ts           # AiutaSdkRpc implementation
│   └── app.ts           # AiutaAppRpc implementation
│
└── protocol/            # ⚡ Core RPC protocol
    ├── core.ts          # Protocol types & constants
    ├── transport.ts     # MessagePort client/server logic
    ├── utils.ts         # Utility functions
    └── internal.ts      # Internal API contracts
```

### 🔄 How It Works Conceptually

The RPC system establishes bidirectional communication between the parent window (SDK) and iframe (App):

```
┌─────────────────────┐                      ┌─────────────────────┐
│   Parent Window     │                      │      Iframe         │
│     (SDK Side)      │                      │    (App Side)       │
│                     │                      │                     │
│  ┌─────────────────┐│                      │┌─────────────────┐  │
│  │  AiutaSdkRpc    ││◄──── Handshake  ────►││  AiutaAppRpc    │  │
│  │                 ││                      ││                 │  │
│  │ • Tracks events ││◄── MessageChannel ──►││ • Handles tryOn │  │
│  │ • Controls      ││                      ││ • Proxies config│  │
│  │   interactivity ││                      ││ • Makes SDK     │  │
│  │                 ││                      ││   calls         │  │
│  └─────────────────┘│                      │└─────────────────┘  │
└─────────────────────┘                      └─────────────────────┘
```

### 🤝 Connection Flow

1. **Initialization**

   ```typescript
   // SDK creates iframe with special URL parameters
   iframe.src = `${appUrl}?parentOrigin=${encodeURIComponent(window.location.origin)}`

   // Both sides create RPC instances
   const sdkRpc = new AiutaSdkRpc({ context, handlers })
   const appRpc = new AiutaAppRpc({ context, handlers })
   ```

2. **Handshake Protocol**

   ```typescript
   // App sends "hello" with nonce to parent
   window.parent.postMessage(
     {
       type: 'aiuta:app:hello',
       nonce: randomNonce,
       appVersion: '1.0.0',
     },
     expectedParentOrigin,
   )

   // SDK responds with MessageChannel
   const channel = new MessageChannel()
   iframe.contentWindow.postMessage(
     {
       type: 'aiuta:sdk:ack',
       nonce: receivedNonce,
       sdkVersion: '1.0.0',
     },
     expectedIframeOrigin,
     [channel.port2],
   )
   ```

3. **Bidirectional RPC Setup**

   ```typescript
   // Both sides setup client/server over MessageChannel
   createRpcServer(port, methodHandlers) // Handle incoming calls
   createRpcClient(port) // Make outgoing calls
   ```

4. **Configuration Proxying**

   ```typescript
   // SDK sends configuration snapshot with function paths
   const configSnapshot = {
     data: { auth: { apiKey: 'key123' }, debug: { enabled: true } },
     functionKeys: ['auth.getToken', 'auth.getUserId'],
   }

   // App rebuilds configuration with proxied functions
   rpc.config.auth.getToken = (...args) => rpc.sdk.invokeConfigFunction('auth.getToken', ...args)
   ```

### 🔧 Message Filtering

**Origin Filtering**: Filters out random messages from other scripts on the page.

```typescript
// App side - filters messages from expected parent only
const expectedParentOrigin = new URLSearchParams(location.search).get('parentOrigin')
if (event.origin !== expectedParentOrigin) return

// SDK side - filters messages from expected iframe only
if (e.source !== iframeEl.contentWindow || e.origin !== resolvedOrigin) return
```

**Nonce Matching**: Ensures handshake messages belong to the same session.

```typescript
const nonce = rand() // Simple random number
// Nonce must match in handshake response
```

**MessageChannel Isolation**: After handshake, uses dedicated MessageChannel instead of global window messaging.

### ⚡ Message Flow Examples

**SDK → App Call** (e.g., `tryOn`)

```
SDK: rpc.app.tryOn('product-123')
 ↓
MessageChannel: { t: 'call', id: 1, m: 'tryOn', a: ['product-123'] }
 ↓
App: handlers.tryOn('product-123')
 ↓
MessageChannel: { t: 'resp', id: 1, ok: true, r: undefined }
 ↓
SDK: Promise resolves
```

**App → SDK Call** (e.g., `trackEvent`)

```
App: rpc.sdk.trackEvent({ action: 'try_on_started' })
 ↓
MessageChannel: { t: 'call', id: 2, m: 'trackEvent', a: [{ action: 'try_on_started' }] }
 ↓
SDK: handlers.trackEvent({ action: 'try_on_started' })
 ↓
MessageChannel: { t: 'resp', id: 2, ok: true, r: undefined }
 ↓
App: Promise resolves
```

**Config Function Proxying** (e.g., `getToken`)

```
App: rpc.config.auth.getToken({ imageId: '123' })
 ↓ (Proxied automatically)
App: rpc.sdk.invokeConfigFunction('auth.getToken', { imageId: '123' })
 ↓
MessageChannel: { t: 'call', id: 3, m: 'invokeConfigFunction', a: ['auth.getToken', { imageId: '123' }] }
 ↓
SDK: config.auth.getToken({ imageId: '123' })
 ↓
MessageChannel: { t: 'resp', id: 3, ok: true, r: 'jwt_token_xyz' }
 ↓
App: Promise resolves with 'jwt_token_xyz'
```

## 🚀 Quick Start

### SDK Side (parent window)

```typescript
import { AiutaSdkRpc } from '@lib/rpc'

const rpc = new AiutaSdkRpc({
  context: { config: configuration, sdkVersion: '1.0.0' },
  handlers: {
    trackEvent: (event) => analytics.track(event),
    setInteractive: (interactive) => iframe.setInteractive(interactive),
  },
})

await rpc.connect(iframe)
await rpc.app.tryOn('product-123')
```

### App Side (iframe content)

```typescript
import { AiutaAppRpc } from '@lib/rpc'

const rpc = new AiutaAppRpc({
  context: { appVersion: '1.0.0' },
  handlers: {
    tryOn: async (productId) => handleTryOn(productId),
  },
})

await rpc.connect()

// Config functions are automatically proxied
const token = await rpc.config.auth.getToken?.({ imageId: '123' })

// Call SDK methods directly
await rpc.sdk.trackEvent({ action: 'try_on_started' })
await rpc.sdk.setInteractive(false) // Make iframe click-through
```

## 🔄 Backward Compatibility

The RPC system supports **bidirectional method detection** for gradual upgrades:

### How It Works

During handshake, both sides exchange their available methods:

```typescript
// App sends its methods in hello message
{
  type: 'aiuta:app:hello',
  methods: ['tryOn', 'newMethod'] // ← App methods
}

// SDK responds with its methods in ack
{
  type: 'aiuta:sdk:ack',
  methods: ['trackEvent', 'setInteractive'] // ← SDK methods
}
```

### Usage

**Check if method exists before calling:**

```typescript
// SDK checking App methods
if (rpc.supports('enhancedTryOn')) {
  await rpc.app.enhancedTryOn(productId, options) // New method
} else {
  await rpc.app.tryOn(productId) // Fallback
}

// App checking SDK methods
if (rpc.supports('advancedAnalytics')) {
  await rpc.sdk.advancedAnalytics(event) // New method
} else {
  await rpc.sdk.trackEvent(event) // Fallback
}
```

### Deployment Scenarios

**Scenario 1: New App, Old SDK**

- App has new methods, but SDK is old
- App can detect SDK doesn't support new methods
- App uses fallback behavior

**Scenario 2: New SDK, Old App**

- SDK has new methods, but App is old
- SDK can detect App doesn't support new methods
- SDK uses fallback behavior

**Scenario 3: Both Updated**

- Both sides detect new methods are available
- Full new functionality enabled

## 📋 API Reference

See the complete API contracts in:

- **[`api/sdk.ts`](api/sdk.ts)** - SDK API (what App can call on SDK)
- **[`api/app.ts`](api/app.ts)** - App API (what SDK can call on App)
