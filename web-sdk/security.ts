/**
 * Security utilities for PostMessage communication
 * Ensures secure communication between SDK and iframe
 */

import {
  SecureMessage,
  MessageHandler,
  MessageAction,
  MessageHandlerRegistration,
  SecureMessenger,
} from '@shared/messaging'

export class SecurityValidator {
  private allowedOrigins: Set<string>
  private iframeOrigin: string

  constructor(iframeOrigin: string, allowedOrigins: string[] = []) {
    this.iframeOrigin = iframeOrigin
    this.allowedOrigins = new Set([iframeOrigin, ...allowedOrigins])
  }

  /**
   * Validate message origin against allowed origins
   */
  validateOrigin(origin: string): boolean {
    return this.allowedOrigins.has(origin)
  }

  /**
   * Validate message structure and required fields
   */
  validateMessage(message: any): message is SecureMessage {
    return (
      message &&
      typeof message === 'object' &&
      typeof message.version === 'string' &&
      typeof message.id === 'string' &&
      typeof message.timestamp === 'number' &&
      typeof message.type === 'string' &&
      ['request', 'response', 'event'].includes(message.type)
    )
  }

  /**
   * Sanitize string input to prevent XSS
   */
  sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  /**
   * Validate URL to prevent malicious redirects
   */
  validateUrl(url: string, allowedDomains: string[] = []): boolean {
    try {
      const parsedUrl = new URL(url)
      return allowedDomains.some(
        (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`),
      )
    } catch {
      return false
    }
  }

  /**
   * Create a secure message with proper structure
   */
  createSecureMessage(
    type: 'request' | 'response' | 'event',
    action?: MessageAction,
    data?: any,
  ): SecureMessage {
    return {
      version: '1.0.0',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      type,
      action,
      data: this.sanitizeData(data),
    }
  }

  /**
   * Sanitize data object recursively
   */
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item))
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeData(value)
      }
      return sanitized
    }

    return data
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get iframe origin for secure communication
   */
  getIframeOrigin(): string {
    return this.iframeOrigin
  }

  /**
   * Check if origin is trusted
   */
  isTrustedOrigin(origin: string): boolean {
    return this.validateOrigin(origin)
  }
}

/**
 * Secure PostMessage handler for iframe communication
 */
export class SecurePostMessageHandler {
  private validator: SecurityValidator
  private messageHandlers: Map<string, MessageHandlerRegistration> = new Map()
  private pendingRequests: Map<
    string,
    { resolve: (value: any) => void; reject: (reason?: any) => void }
  > = new Map()

  constructor(iframeOrigin: string, allowedOrigins: string[] = []) {
    this.validator = new SecurityValidator(iframeOrigin, allowedOrigins)
    this.setupMessageListener()
  }

  /**
   * Register a message handler for specific actions
   */
  registerHandler(action: string, handler: MessageHandler): void {
    this.messageHandlers.set(action, { action: action as MessageAction, handler })
  }

  /**
   * Send secure message to iframe
   */
  sendToIframe(iframe: HTMLIFrameElement, action: string, data?: any): Promise<any> {
    if (!iframe?.contentWindow) {
      return Promise.reject(new Error('Iframe not available'))
    }

    const message = this.validator.createSecureMessage('request', action as MessageAction, data)

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(message.id, { resolve, reject })

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(message.id)) {
          this.pendingRequests.delete(message.id)
          reject(new Error(`Request timeout for action: ${action}`))
        }
      }, 10000) // 10 second timeout

      iframe.contentWindow!.postMessage(message, this.validator.getIframeOrigin())
    })
  }

  /**
   * Send secure event to iframe (no response expected)
   */
  sendEventToIframe(iframe: HTMLIFrameElement, action: string, data?: any): void {
    if (!iframe?.contentWindow) {
      console.error('Iframe not available')
      return
    }

    const message = this.validator.createSecureMessage('event', action as MessageAction, data)
    iframe.contentWindow.postMessage(message, this.validator.getIframeOrigin())
  }

  /**
   * Send secure message to parent window
   */
  sendToParent(action: string, data?: any): void {
    const message = this.validator.createSecureMessage('event', action as MessageAction, data)
    SecureMessenger.sendToParent(message)
  }

  /**
   * Setup secure message listener
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      // Validate origin first
      if (!this.validator.validateOrigin(event.origin)) {
        console.warn(`Rejected message from untrusted origin: ${event.origin}`)
        return
      }

      // Validate message structure
      if (!this.validator.validateMessage(event.data)) {
        console.warn('Rejected malformed message:', event.data)
        return
      }

      const message = event.data as SecureMessage

      // Handle response messages (for pending requests)
      if (message.type === 'response' && this.pendingRequests.has(message.id)) {
        const { resolve } = this.pendingRequests.get(message.id)!
        this.pendingRequests.delete(message.id)
        resolve(message.data)
        return
      }

      // Handle event/request messages
      if (message.action && this.messageHandlers.has(message.action)) {
        const handlerRegistration = this.messageHandlers.get(message.action)!
        try {
          handlerRegistration.handler(message, event.origin)
        } catch (error) {
          console.error(`Error handling message action ${message.action}:`, error)
        }
      }
    })
  }

  /**
   * Respond to a request message
   */
  respondToRequest(requestId: string, data: any): void {
    const response = this.validator.createSecureMessage('response', undefined, data)
    response.id = requestId
    SecureMessenger.sendToParent(response)
  }

  /**
   * Get validator instance for additional security checks
   */
  getValidator(): SecurityValidator {
    return this.validator
  }
}
