/**
 * Resolves the `Aiuta` constructor.
 *
 * - In the built `demo.html` the version-locked SDK is loaded via
 *   `<script src="./index.umd.js">` (injected by vite.config.demo.ts), so we use
 *   the global `window.Aiuta`.
 * - In dev we import the SDK TypeScript source so SDK code stays in the HMR graph
 *   and edits to `sdk/*` hot-reload alongside the demo and the iframe app.
 *
 * `import.meta.env.DEV` is statically replaced by Vite, so the unused branch (and
 * the `@sdk/index` source import) is dropped from the production bundle.
 */

type AiutaCtor = (typeof import('@sdk/index'))['Aiuta']

export type AiutaInstance = InstanceType<AiutaCtor>

export const loadAiuta = async (): Promise<AiutaCtor> => {
  if (import.meta.env.DEV) {
    return (await import('@sdk/index')).Aiuta
  }
  return (window as unknown as { Aiuta: AiutaCtor }).Aiuta
}
