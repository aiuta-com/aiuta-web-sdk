/**
 * Shared message action constants
 * Used by both SDK and iframe to ensure consistency
 */

export const MESSAGE_ACTIONS = {
  // SDK to iframe actions
  BASE_KEYS: 'baseKeys',
  JWT_TOKEN: 'jwt',
  STYLES_CONFIGURATION: 'stylesConfiguration',
  RESIZE: 'resize',
  IFRAME_FULLSCREEN_ACTIVE: 'IFRAME_FULLSCREEN_ACTIVE',

  // Iframe to SDK actions
  CLOSE_MODAL: 'close_modal',
  OPEN_SHARE_MODAL: 'open_share_modal',
  SHARE_IMAGE: 'SHARE_IMAGE',
  GET_WINDOW_SIZES: 'get_window_sizes',
  GET_AIUTA_JWT_TOKEN: 'GET_AIUTA_JWT_TOKEN',
  GET_AIUTA_API_KEYS: 'GET_AIUTA_API_KEYS',
  GET_AIUTA_STYLES_CONFIGURATION: 'GET_AIUTA_STYLES_CONFIGURATION',
  OPEN_AIUTA_FULL_SCREEN_MODAL: 'OPEN_AIUTA_FULL_SCREEN_MODAL',
  OPEN_AIUTA_SHARE_MODAL: 'OPEN_AIUTA_SHARE_MODAL',
  REQUEST_FULLSCREEN_IFRAME: 'REQUEST_FULLSCREEN_IFRAME',
  IFRAME_LOADED: 'IFRAME_LOADED',

  // Image management actions
  REMOVE_HISTORY_IMAGES: 'REMOVE_HISTORY_IMAGES',
  REMOVE_PREVIOUSELY_IMAGES: 'REMOVE_PREVIOUSELY_IMAGES',

  // Analytics events
  ANALYTICS_EVENT: 'analytics_event',

  // System actions
  UNKNOWN: 'unknown',
} as const

export const MESSAGE_TYPES = {
  REQUEST: 'request',
  RESPONSE: 'response',
  EVENT: 'event',
} as const

export const MESSAGE_VERSION = '1.0.0'

export type MessageAction = (typeof MESSAGE_ACTIONS)[keyof typeof MESSAGE_ACTIONS]
export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES]
