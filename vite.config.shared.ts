/**
 * Constants, functions, and utilities used across different Vite configs
 */

import pkg from './package.json'

export const buildConfig = {
  // Domain configurations
  domain: {
    dev: {
      api: 'api.dev.aiuta.com',
      static: 'static.dev.aiuta.com',
    },
    preprod: {
      api: 'api.preprod.aiuta.com',
      static: 'static.preprod.aiuta.com',
    },
    prod: {
      api: 'api.aiuta.com',
      static: 'static.aiuta.com',
    },
  },

  // API paths
  api: {
    tryOn: 'digital-try-on/v1',
    analytics: 'analytics/v1/web-sdk-analytics',
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

  // Branches
  branch: {
    default: 'main',
    current: process.env.AIUTA_APP_BRANCH || 'dev',
  },
} as const

/**
 * Get app and analytics URLs for different build modes
 */
export const getEnvironmentUrls = (mode: string) => {
  switch (mode) {
    case 'debug':
      return getDebugUrlsForDomain(buildConfig.domain.dev)

    case 'dev':
      return getStageUrlsForDomain(buildConfig.domain.dev, buildConfig.branch.current)

    case 'preprod':
      return getStageUrlsForDomain(buildConfig.domain.preprod, buildConfig.branch.default)

    case 'strict':
      return getStageUrlsForDomain(buildConfig.domain.prod, `v${pkg.version}`)

    default:
      return getStageUrlsForDomain(buildConfig.domain.prod, `v${getMajor(pkg.version)}`)
  }
}

/**
 * Generate environment URLs for a specific domain
 */
const getStageUrlsForDomain = (domain: { api: string; static: string }, branch: string) => {
  return {
    appUrl: getAppPath(domain.static, branch),
    ...getApiUrls(domain.api),
  }
}

/**
 * Generate debug URLs for a specific domain
 */
const getDebugUrlsForDomain = (domain: { api: string; static: string }) => {
  return {
    appUrl: `/${buildConfig.path.app}/${buildConfig.path.index}`,
    ...getApiUrls(domain.api),
  }
}

/**
 * Generate API URLs for a specific domain
 */
const getApiUrls = (apiDomain: string) => {
  return {
    tryOnApiUrl: buildUrl(apiDomain, buildConfig.api.tryOn),
    analyticsUrl: buildUrl(apiDomain, buildConfig.api.analytics),
  }
}

/**
 * Helper function to get the app path
 */
const getAppPath = (domain: string, branch: string) => {
  return buildUrl(domain, buildConfig.path.sdk, branch, buildConfig.path.index)
}

/**
 * Helper function to build URLs from domain parts
 */
const buildUrl = (...parts: string[]): string => `https://${parts.join('/')}`

/**
 * Safely extract major version from version string
 */
const getMajor = (version: string): string => {
  const major = version?.split('.')?.[0]
  return major && !isNaN(Number(major)) ? major : '0'
}
