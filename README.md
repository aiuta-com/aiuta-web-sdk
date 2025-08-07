# Aiuta Web SDK

A lightweight JavaScript SDK to embed the Aiuta image generation iframe.

---

## Features

- Embed Aiuta image generation experience via iframe.
- Share generated images via **WhatsApp**, **Messenger**, or by copying the URL.

---

## Basic usage

```ts
var aiuta = new Aiuta("your_api_key_here");
aiuta.startGeneration("your_product_id_here");
```

---

## Publishing Process

The SDK is automatically published using GitHub Actions when a new version tag is pushed to the repository.

### How to publish a new version

1. Update the version in `package.json`
2. Commit your changes
3. Create and push a new tag with the version number:
   ```bash
   git tag v1.0.0  # Replace with the actual version
   git push origin v1.0.0
   ```

