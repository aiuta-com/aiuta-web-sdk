/**
 * Constants, functions, and utilities used across different Vite configs
 */

import pkg from './package.json'

export const buildConfig = {
  // Environments
  env: {
    debug: {
      // relative static, prod api, debug analytics
      api: 'https://api.aiuta.com/digital-try-on/v1',
      analytics: 'https://api.dev.aiuta.com/analytics/v1/web-sdk-analytics',
    },
    dev: {
      static: 'https://static.dev.aiuta.com',
      api: 'https://api.dev.aiuta.com/digital-try-on/v1',
      analytics: 'https://api.dev.aiuta.com/analytics/v1/web-sdk-analytics',
    },
    preprod: {
      static: 'https://static.preprod.aiuta.com',
      api: 'https://api.preprod.aiuta.com/digital-try-on/v1',
      analytics: 'https://api.preprod.aiuta.com/analytics/v1/web-sdk-analytics',
    },
    prod: {
      static: 'https://static.aiuta.com',
      api: 'https://api.aiuta.com/digital-try-on/v1',
      analytics: 'https://api.aiuta.com/analytics/v1/web-sdk-analytics',
    },
  },

  // Project structure
  path: {
    app: 'app',
    sdk: 'sdk',
    lib: 'lib',
    src: 'src',
    dist: 'dist',
    assets: 'assets',
    index: 'index.html',
  },
} as const

/**
 * Get app and analytics URLs for different build modes
 */
export const getEnvironmentUrls = (mode: string) => {
  switch (mode) {
    case 'debug':
      return getDebugUrlsForEnv(buildConfig.env.debug)

    case 'dev':
      return getStageUrlsForEnv(buildConfig.env.dev)

    case 'preprod':
      return getStageUrlsForEnv(buildConfig.env.preprod)

    default:
      return getStageUrlsForEnv(buildConfig.env.prod)
  }
}

/**
 * Generate environment URLs for a specific domain
 */
const getStageUrlsForEnv = (env: { static: string; api: string; analytics: string }) => {
  const appPath = process.env.AIUTA_APP_PATH || getMajorPath()
  return {
    appUrl: `${env.static}/${appPath}/${buildConfig.path.index}`,
    tryOnApiUrl: env.api,
    analyticsUrl: env.analytics,
  }
}

/**
 * Generate debug URLs for a specific domain
 */
const getDebugUrlsForEnv = (env: { api: string; analytics: string }) => {
  return {
    appUrl: `/${buildConfig.path.app}/${buildConfig.path.index}`,
    tryOnApiUrl: env.api,
    analyticsUrl: env.analytics,
  }
}

/**
 * Fallback to major version path if app path is not set
 */
const getMajorPath = (): string => {
  const major = pkg.version.split('.')?.[0]
  return `${buildConfig.path.sdk}/v${major}`
}
