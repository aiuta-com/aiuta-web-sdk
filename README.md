# Aiuta Web SDK

A lightweight JavaScript SDK to embed the Aiuta image generation iframe.

---

## Features

- Embed Aiuta image generation experience via iframe.
- Share generated images via **WhatsApp**, **Messenger**, or by copying the URL.

---

## Quick Start

```js
<script src="https://static.aiuta.com/sdk/v0.0.65/index.umd.js"></script>
```

## Basic usage

```ts
var aiuta = new Aiuta();

// Option 1: Initialize with API Key
aiuta.initWithApiKey({
   apiKey: "your_api_key_here",
   analytics: (eventName: string, data:any) => Promise<{eventName, data}>,
   stylesConfiguration: {
      pages: {
         qrPageClassName: string,
         historyClassName: string,
         viewPageClassName: string,
         esultPageClassName: string,
         onboardingPageClassName: string,
         previouselyPageClassName: string,
      },
      components: {
         headerClassName: string,
         footerClassName: string,
         tryOnButtonClassName: string,
         historyBannerClassName: string,
         secondaryButtonClassName: string,
         changePhotoButtonClassName: string,
         resultButonsContentClassName: string,
         historyImagesRemoveModalClassNames: string,
      },
   },
});

// OR

// Option 2: Initialize with JWT
aiuta.initWithJwt({
   subscriptionId: string;
   getJwt: (params: Record<string, string>) => string | Promise<string>;
   analytics: (eventName: string, data:any) => Promise<{eventName, data}>;
   stylesConfiguration: {
      pages: {
         qrPageClassName: string,
         historyClassName: string,
         viewPageClassName: string,
         esultPageClassName: string,
         onboardingPageClassName: string,
         previouselyPageClassName: string,
      },
      components: {
         headerClassName: string,
         footerClassName: string,
         tryOnButtonClassName: string,
         historyBannerClassName: string,
         secondaryButtonClassName: string,
         changePhotoButtonClassName: string,
         resultButonsContentClassName: string,
         historyImagesRemoveModalClassNames: string,
      },
   },
});
```
