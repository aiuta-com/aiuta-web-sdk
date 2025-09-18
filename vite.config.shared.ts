/**
 * Constants, functions, and utilities used across different Vite configs
 */

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
  apiPath: {
    analytics: 'analytics/v1/web-sdk-analytics',
  },

  // Project structure paths
  path: {
    app: 'app',
    sdk: 'sdk',
    lib: 'lib',
    src: 'src',
    dist: 'dist',
    bootstrap: 'bootstrap',
    assets: 'assets',
  },

  // Branches
  branch: {
    default: 'main',
  },

  // File names
  file: {
    index: 'index.html',
    indexJs: 'index.js',
  },

  // Build patterns
  pattern: {
    nameHash: '[name]-[hash]',
    nameHashJs: '[name]-[hash].js',
    nameHashExt: '[name]-[hash].[ext]',
  },

  // Placeholders for build replacement
  placeholder: {
    mainHash: '__MAIN_HASH__',
  },

  // Entry names
  entry: {
    main: 'main',
    bootstrap: 'bootstrap',
  },

  // File extensions
  ext: {
    html: '.html',
    js: '.js',
    css: '.css',
    scss: '.scss',
  },
} as const

/**
 * Helper function to build URLs from domain parts
 */
export const buildUrl = (...parts: string[]): string => `https://${parts.join('/')}`

/**
 * Get app and analytics URLs for different build modes
 */
export const getEnvironmentUrls = (mode: string, version: string) => {
  const fullVersion = version
  const majorVersion = fullVersion.split('.')[0]

  switch (mode) {
    case 'debug':
      return {
        appUrl: `/${buildConfig.path.app}/${buildConfig.file.index}`,
        analyticsUrl: buildUrl(buildConfig.domain.dev.api, buildConfig.apiPath.analytics),
      }

    case 'dev':
      const branch = process.env.AIUTA_APP_BRANCH || buildConfig.branch.default
      return {
        appUrl: buildUrl(
          buildConfig.domain.dev.static,
          buildConfig.path.sdk,
          branch,
          buildConfig.file.index,
        ),
        analyticsUrl: buildUrl(buildConfig.domain.dev.api, buildConfig.apiPath.analytics),
      }

    case 'preprod':
      return {
        appUrl: buildUrl(
          buildConfig.domain.preprod.static,
          buildConfig.path.sdk,
          buildConfig.branch.default,
          buildConfig.file.index,
        ),
        analyticsUrl: buildUrl(buildConfig.domain.preprod.api, buildConfig.apiPath.analytics),
      }

    case 'strict':
      return {
        appUrl: buildUrl(
          buildConfig.domain.prod.static,
          buildConfig.path.sdk,
          `v${fullVersion}`,
          buildConfig.file.index,
        ),
        analyticsUrl: buildUrl(buildConfig.domain.prod.api, buildConfig.apiPath.analytics),
      }

    default:
      return {
        appUrl: buildUrl(
          buildConfig.domain.prod.static,
          buildConfig.path.sdk,
          `v${majorVersion}`,
          buildConfig.file.index,
        ),
        analyticsUrl: buildUrl(buildConfig.domain.prod.api, buildConfig.apiPath.analytics),
      }
  }
}
