# Aiuta Web SDK

A lightweight JavaScript SDK to embed the Aiuta image generation iframe.

---

## Features

- Embed Aiuta image generation experience via iframe.
- Share generated images via **WhatsApp**, **Messenger**, or by copying the URL.

---

## Quick Start

```js
<script src="https://static.dev.aiuta.com/sdk/v0.0.56/index.umd.js"></script>
```

## Basic usage

```ts
var aiuta = new Aiuta();

// Option 1: Initialize with API Key
aiuta.initWithApiKey("your_api_key_here");

// OR

// Option 2: Initialize with JWT
aiuta.initWithJwt({
   subscriptionId: string;
   getJwt: (params: Record<string, string>) => string | Promise<string>;
});
```
