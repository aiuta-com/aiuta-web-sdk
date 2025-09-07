import { SecureMessage, RequestMessage, ResponseMessage, EventMessage } from './types'
import { MESSAGE_TYPES, MESSAGE_VERSION } from './constants'

/**
 * Utility class for creating and managing secure messages
 * Eliminates boilerplate code and ensures consistency
 */
export class MessageMessenger {
  private static messageIdCounter = 0

  /**
   * Generate unique message ID
   */
  private static generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}_${Math.random().toString(36).substr(2, 6)}`
  }

  /**
   * Create a request message
   */
  static createRequest(action: string, data?: any): RequestMessage {
    return {
      version: MESSAGE_VERSION,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      type: MESSAGE_TYPES.REQUEST,
      action: action as any,
      data,
    }
  }

  /**
   * Create a response message
   */
  static createResponse(requestId: string, data?: any): ResponseMessage {
    return {
      version: MESSAGE_VERSION,
      id: requestId,
      timestamp: Date.now(),
      type: MESSAGE_TYPES.RESPONSE,
      data,
    }
  }

  /**
   * Create an event message
   */
  static createEvent(action: string, data?: any): EventMessage {
    return {
      version: MESSAGE_VERSION,
      id: this.generateMessageId(),
      timestamp: Date.now(),
      type: MESSAGE_TYPES.EVENT,
      action: action as any,
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
    iframe.contentWindow.postMessage(message, targetOrigin)
  }

  /**
   * Send message to parent window with secure origin
   * Accepts plain objects to preserve existing message structures
   */
  static sendToParent(message: any, targetOrigin?: string): void {
    const origin = targetOrigin || this.getParentOrigin()
    window.parent.postMessage(message, origin)
  }

  /**
   * Get parent origin securely
   */
  private static getParentOrigin(): string {
    // Try to get origin from ancestorOrigins (most reliable)
    if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
      return window.location.ancestorOrigins[0]
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
   * Validate message structure
   */
  static validateMessage(message: any): message is SecureMessage {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.version === 'string' &&
      typeof message.id === 'string' &&
      typeof message.timestamp === 'number' &&
      typeof message.type === 'string' &&
      Object.values(MESSAGE_TYPES).includes(message.type)
    )
  }

  /**
   * Check if message is from trusted origin
   */
  static validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    return allowedOrigins.includes(origin)
  }
}

/**
 * Secure message sending utilities
 */
export const SecureMessenger = {
  /**
   * Send message to parent with automatic origin detection
   * Wraps simple messages in proper SecureMessage structure
   */
  sendToParent: (message: any, targetOrigin?: string) => {
    // If message already has proper structure, send as-is
    if (message.version && message.id && message.timestamp && message.type) {
      MessageMessenger.sendToParent(message, targetOrigin)
    } else {
      // Wrap simple message in proper SecureMessage structure
      const secureMessage = MessageMessenger.createEvent(message.action || 'unknown', message)
      MessageMessenger.sendToParent(secureMessage, targetOrigin)
    }
  },

  /**
   * Send message to iframe with specific origin
   * Wraps simple messages in proper SecureMessage structure
   */
  sendToIframe: (iframe: HTMLIFrameElement, message: any, targetOrigin: string) => {
    // If message already has proper structure, send as-is
    if (message.version && message.id && message.timestamp && message.type) {
      MessageMessenger.sendToIframe(iframe, message, targetOrigin)
    } else {
      // Wrap simple message in proper SecureMessage structure
      const secureMessage = MessageMessenger.createEvent(message.action || 'unknown', message)
      MessageMessenger.sendToIframe(iframe, secureMessage, targetOrigin)
    }
  },
}
