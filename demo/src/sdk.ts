/**
 * Everything about the SDK integration on the demo page: resolving the `Aiuta`
 * constructor, the demo's SDK configuration and the lazily created singleton.
 *
 * Constructor resolution:
 * - In the built `demo.html` the version-locked SDK is loaded via
 *   `<script src="./index.umd.js">` (injected by vite.config.demo.ts), so we use
 *   the global `window.Aiuta`.
 * - In dev we import the SDK TypeScript source so SDK code stays in the HMR graph
 *   and edits to `sdk/*` hot-reload alongside the demo and the iframe app.
 *
 * `import.meta.env.DEV` is statically replaced by Vite, so the unused branch (and
 * the `@sdk/index` source import) is dropped from the production bundle.
 */

import { demoConfig } from './utils/config'
import type { AiutaConfiguration } from '@sdk/index'

const aiutaConfiguration: AiutaConfiguration = {
  auth: { apiKey: demoConfig.apiKey },
  userInterface: {
    theme: {
      // Drop the desktop panel below the demo header so the env/version
      // badges in the top-right corner stay visible.
      customCss: `
        .aiuta-app--desktop {
          top: 54px;
          right: 24px;
        }
      `,
    },
  },
  analytics: {
    handler: {
      onAnalyticsEvent: (event) => console.log('Analytics', event),
    },
  },
  debugSettings: {
    isLoggingEnabled: true,
    // Derive the app dev-server host from the page URL so the try-on iframe
    // also loads when the demo is opened from another device on the LAN
    // (e.g. http://nmac.local:9876 → http://nmac.local:9875).
    iframeAppUrl: import.meta.env.DEV
      ? `${window.location.protocol}//${window.location.hostname}:9875/`
      : undefined,
  },
}

type AiutaCtor = (typeof import('@sdk/index'))['Aiuta']

export type AiutaInstance = InstanceType<AiutaCtor>

const loadAiuta = async (): Promise<AiutaCtor> => {
  if (import.meta.env.DEV) {
    return (await import('@sdk/index')).Aiuta
  }
  return (window as unknown as { Aiuta: AiutaCtor }).Aiuta
}

// Creating an Aiuta instance mounts the SDK iframe, so it must happen exactly
// once. Memoizing the promise (not the instance) also queues try-on calls that
// land while the SDK is still loading.
let aiuta: Promise<AiutaInstance> | null = null

export const getAiuta = (): Promise<AiutaInstance> => {
  if (!aiuta) {
    aiuta = loadAiuta().then((Aiuta) => new Aiuta(aiutaConfiguration))
  }
  return aiuta
}
