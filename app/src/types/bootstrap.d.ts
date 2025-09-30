/**
 * Bootstrap integration types
 *
 * These types define the interface between the minimal bootstrap loader
 * and the main application for seamless transition.
 */

interface AiutaBootstrap {
  /** Bootstrap initialization flag */
  ready: boolean

  /** Main app readiness flag */
  isMainAppReady: boolean

  /** Hide bootstrap and show main app */
  hideBootstrap: () => void
}

declare global {
  interface Window {
    aiutaBootstrap?: AiutaBootstrap
  }
}

export {}
