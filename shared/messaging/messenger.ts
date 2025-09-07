import {
  SecureMessage,
  RequestMessage,
  ResponseMessage,
  EventMessage,
  MessageHandler,
} from './types'
import { MESSAGE_TYPES, MESSAGE_VERSION, MESSAGE_ACTIONS, MessageAction } from './constants'

/**
 * Utility class for creating and managing secure messages
 * Eliminates boilerplate code and ensures consistency
 */
export class MessageMessenger {
  private static messageIdCounter = 0

  /**
   * Generate unique message ID with improved randomness
   */
  private static generateMessageId(): string {
    const timestamp = Date.now()
    const counter = ++this.messageIdCounter
    const random = Math.random().toString(36).slice(2, 8)
    return `msg_${timestamp}_${counter}_${random}`
  }

  /**
   * Create a request message
   */
  static createRequest(action: MessageAction, data?: any): RequestMessage {
    return {
      version: MESSAGE_VERSION,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      type: MESSAGE_TYPES.REQUEST,
      action,
      data,
    }
  }

  /**
   * Create a response message with proper correlationId
   */
  static createResponse(requestId: string, data?: any): ResponseMessage {
    return {
      version: MESSAGE_VERSION,
      id: this.generateMessageId(), // Generate new unique ID
      timestamp: Date.now(),
      type: MESSAGE_TYPES.RESPONSE,
      correlationId: requestId, // Link to original request
      data,
    }
  }

  /**
   * Create an event message
   */
  static createEvent(action: MessageAction, data?: any): EventMessage {
    return {
      version: MESSAGE_VERSION,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      type: MESSAGE_TYPES.EVENT,
      action,
      data,
    }
  }

  /**
   * Send message to iframe with proper origin validation
   */
  static sendToIframe(
    iframe: HTMLIFrameElement,
    message: SecureMessage,
    targetOrigin: string,
  ): void {
    if (!iframe?.contentWindow) {
      throw new Error('Iframe not available')
    }

    // Prevent wildcard origin for security
    if (targetOrigin === '*') {
      throw new Error('Wildcard origin (*) is not allowed for security reasons')
    }

    iframe.contentWindow.postMessage(message, targetOrigin)
  }

  /**
   * Send message to parent window with secure origin
   * Accepts plain objects to preserve existing message structures
   */
  static sendToParent(message: any, targetOrigin?: string): void {
    const origin = targetOrigin || this.getParentOrigin()

    // Prevent wildcard origin for security
    if (origin === '*') {
      throw new Error('Wildcard origin (*) is not allowed for security reasons')
    }

    window.parent.postMessage(message, origin)
  }

  /**
   * Get parent origin securely with improved detection
   */
  private static getParentOrigin(): string {
    // Check if we're in a top-level window
    if (window.parent === window) {
      throw new Error('sendToParent called in top-level window - not inside an iframe')
    }

    // Try to get origin from ancestorOrigins (most reliable)
    if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
      return window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
    }

    // Fallback to document.referrer
    if (document.referrer) {
      try {
        return new URL(document.referrer).origin
      } catch {
        // Invalid referrer
      }
    }

    // Last resort - use current origin (for same-origin scenarios)
    return window.location.origin
  }

  /**
   * Validate message structure with comprehensive checks
   */
  static validateMessage(
    message: any,
    options?: { timestampWindowMs?: number },
  ): message is SecureMessage {
    if (!message || typeof message !== 'object') {
      return false
    }

    // Check basic structure
    if (
      typeof message.version !== 'string' ||
      typeof message.id !== 'string' ||
      typeof message.timestamp !== 'number' ||
      typeof message.type !== 'string'
    ) {
      return false
    }

    // Check version matches expected version
    if (message.version !== MESSAGE_VERSION) {
      return false
    }

    // Check type is valid
    if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
      return false
    }

    // Check timestamp is reasonable (configurable window)
    const now = Date.now()
    const windowMs = options?.timestampWindowMs ?? 5 * 60 * 1000 // 5 minutes default
    const windowStart = now - windowMs
    const windowEnd = now + 60 * 1000 // Always allow 1 minute in the future
    if (message.timestamp < windowStart || message.timestamp > windowEnd) {
      return false
    }

    // Check action exists for REQUEST and EVENT types
    if (message.type === MESSAGE_TYPES.REQUEST || message.type === MESSAGE_TYPES.EVENT) {
      if (!message.action || typeof message.action !== 'string') {
        return false
      }
    }

    // Check correlationId exists for RESPONSE type
    if (message.type === MESSAGE_TYPES.RESPONSE) {
      if (!message.correlationId || typeof message.correlationId !== 'string') {
        return false
      }
    }

    return true
  }

  /**
   * Parse origin into components for flexible matching
   */
  static parseOrigin(origin: string): { protocol: string; host: string; full: string } | null {
    try {
      const url = new URL(origin)
      return {
        protocol: url.protocol,
        host: url.host,
        full: `${url.protocol}//${url.host}`,
      }
    } catch {
      return null
    }
  }

  /**
   * Normalize origin for comparison (legacy method for backward compatibility)
   */
  static normalizeOrigin(origin: string): string {
    const parsed = this.parseOrigin(origin)
    return parsed ? parsed.full : origin
  }

  /**
   * Check if message is from trusted origin with pattern support
   */
  static validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    const parsedOrigin = this.parseOrigin(origin)
    if (!parsedOrigin) {
      return false
    }

    return allowedOrigins.some((allowed) => {
      // Parse the allowed origin/pattern
      const parsedAllowed = this.parseOrigin(allowed)

      if (parsedAllowed) {
        // Both are full origins - exact match required
        return parsedOrigin.full === parsedAllowed.full
      } else {
        // Allowed is a pattern (e.g., *.example.com or example.com)
        if (allowed.startsWith('*.')) {
          // Wildcard subdomain pattern (e.g., *.example.com)
          const domain = allowed.slice(2)
          return this.isValidSubdomainMatch(parsedOrigin.host, domain)
        } else {
          // Bare host pattern (e.g., example.com)
          return parsedOrigin.host === allowed
        }
      }
    })
  }

  /**
   * Check if host matches subdomain pattern securely
   */
  private static isValidSubdomainMatch(host: string, domain: string): boolean {
    // Must be exactly equal to domain or end with . + domain
    return host === domain || host.endsWith('.' + domain)
  }
}

/**
 * Secure message sending utilities with improved typing
 */
export const SecureMessenger = {
  /**
   * Send analytics event to parent
   */
  sendAnalyticsEvent: (analytic: any) => {
    SecureMessenger.sendToParent({
      action: MESSAGE_ACTIONS.ANALYTICS_EVENT,
      analytic,
    })
  },

  /**
   * Send message to parent with automatic origin detection
   * Wraps simple messages in proper SecureMessage structure
   */
  sendToParent: (
    message: SecureMessage | { action: MessageAction; [key: string]: any },
    targetOrigin?: string,
  ) => {
    // If message already has proper structure, send as-is
    if ('version' in message && 'id' in message && 'timestamp' in message && 'type' in message) {
      MessageMessenger.sendToParent(message as SecureMessage, targetOrigin)
    } else {
      // Wrap simple message in proper SecureMessage structure
      const action = 'action' in message ? message.action : MESSAGE_ACTIONS.UNKNOWN
      const secureMessage = MessageMessenger.createEvent(action, message)
      MessageMessenger.sendToParent(secureMessage, targetOrigin)
    }
  },

  /**
   * Send message to iframe with specific origin
   * Wraps simple messages in proper SecureMessage structure
   */
  sendToIframe: (
    iframe: HTMLIFrameElement,
    message: SecureMessage | { action: MessageAction; [key: string]: any },
    targetOrigin: string,
  ) => {
    // If message already has proper structure, send as-is
    if ('version' in message && 'id' in message && 'timestamp' in message && 'type' in message) {
      MessageMessenger.sendToIframe(iframe, message as SecureMessage, targetOrigin)
    } else {
      // Wrap simple message in proper SecureMessage structure
      const action = 'action' in message ? message.action : MESSAGE_ACTIONS.UNKNOWN
      const secureMessage = MessageMessenger.createEvent(action, message)
      MessageMessenger.sendToIframe(iframe, secureMessage, targetOrigin)
    }
  },
}

/**
 * Secure message receiver helper
 * Provides safe message handling with origin and schema validation
 */
export class SecureMessageReceiver {
  private allowedOrigins: string[]
  private messageHandlers: Map<string, MessageHandler> = new Map()
  private responseHandlers: Map<string, MessageHandler> = new Map()
  private messageListener: ((event: MessageEvent) => void) | null = null

  constructor(allowedOrigins: string[]) {
    this.allowedOrigins = allowedOrigins
  }

  /**
   * Register a message handler for a specific action
   */
  registerHandler(action: MessageAction, handler: MessageHandler): void {
    this.messageHandlers.set(action, handler)
  }

  /**
   * Register a response handler for a specific correlationId
   */
  registerResponseHandler(
    correlationId: string,
    handler: MessageHandler,
    options?: { persistent?: boolean },
  ): void {
    this.responseHandlers.set(correlationId, handler)
    // Store persistence option for cleanup logic
    if (options?.persistent) {
      this.responseHandlers.set(`_persistent_${correlationId}`, handler)
    }
  }

  /**
   * Check if origin is allowed using the new validation logic
   */
  private isOriginAllowed(origin: string): boolean {
    return MessageMessenger.validateOrigin(origin, this.allowedOrigins)
  }

  /**
   * Handle incoming message with full validation
   */
  handleMessage(event: MessageEvent): void {
    // Validate origin using the new validation logic
    if (!this.isOriginAllowed(event.origin)) {
      console.warn(`Rejected message from untrusted origin: ${event.origin}`)
      return
    }

    // Validate message structure
    if (!MessageMessenger.validateMessage(event.data)) {
      console.warn('Rejected malformed message:', event.data)
      return
    }

    const message = event.data as SecureMessage

    // Route to appropriate handler
    if (message.type === MESSAGE_TYPES.RESPONSE && message.correlationId) {
      // Handle response messages by correlationId
      if (this.responseHandlers.has(message.correlationId)) {
        const handler = this.responseHandlers.get(message.correlationId)!
        try {
          handler(message, event.origin)
        } catch (error) {
          console.error(
            `Error in response handler for correlationId ${message.correlationId}:`,
            error,
          )
        }
        // Remove the handler after use (one-time response) unless persistent
        if (!this.responseHandlers.has(`_persistent_${message.correlationId}`)) {
          this.responseHandlers.delete(message.correlationId)
        }
      } else {
        console.warn(`No response handler registered for correlationId: ${message.correlationId}`)
      }
    } else if (message.action && this.messageHandlers.has(message.action)) {
      // Handle action-based messages
      const handler = this.messageHandlers.get(message.action)!
      try {
        handler(message, event.origin)
      } catch (error) {
        console.error(`Error in message handler for action ${message.action}:`, error)
      }
    } else {
      console.warn(`No handler registered for action: ${message.action}`)
    }
  }

  /**
   * Setup message listener with this receiver
   */
  setupListener(): void {
    if (this.messageListener) {
      this.cleanup()
    }
    this.messageListener = (event: MessageEvent) => this.handleMessage(event)
    window.addEventListener('message', this.messageListener)
  }

  /**
   * Cleanup message listener
   */
  cleanup(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener)
      this.messageListener = null
    }
    // Clear all handlers
    this.messageHandlers.clear()
    this.responseHandlers.clear()
  }
}
