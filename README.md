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

The SDK is automatically published using GitHub Actions when a new GitHub release is created.

### How to publish a new version

1. Create a new GitHub release:
   - Go to the repository's "Releases" page
   - Click "Create a new release"
   - Enter the tag version (e.g., `v1.0.0`) - this will be used to automatically update the version in `package.json`
   - Add a title and description for the release
   - Click "Publish release"

### What happens during the release process

When a new release is created:

1. The workflow automatically updates the version in `package.json` based on the git tag
2. The changes are committed back to the repository
3. The project is built with the updated version
