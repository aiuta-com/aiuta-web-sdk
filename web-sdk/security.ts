/**
 * Simplified secure messaging for SDK to iframe communication
 * Uses the existing shared messaging infrastructure
 */

import { SecureMessenger, MessageAction } from '@shared/messaging'

type MessageHandler = (data: any) => void

interface SimpleMessage {
  action: MessageAction
  data?: any
}

/**
 * Simplified secure messaging handler for SDK side
 */
export class SecurePostMessageHandler {
  private allowedOrigin: string
  private messageHandlers = new Map<string, MessageHandler>()

  constructor(iframeOrigin: string) {
    this.allowedOrigin = iframeOrigin
    this.setupMessageListener()
  }

  /**
   * Register a message handler for specific action
   */
  registerHandler(action: MessageAction, handler: MessageHandler): void {
    this.messageHandlers.set(action, handler)
  }

  /**
   * Send message to iframe using proper origin validation
   */
  sendToIframe(iframe: HTMLIFrameElement, action: MessageAction, data?: any): void {
    const message: SimpleMessage = { action, data }
    SecureMessenger.sendToIframe(iframe, message, this.allowedOrigin)
  }

  /**
   * Setup message listener with origin validation
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== this.allowedOrigin) {
        console.warn(`Rejected message from untrusted origin: ${event.origin}`)
        return
      }

      // Validate message structure
      if (!event.data || typeof event.data.action !== 'string') {
        console.warn('Rejected malformed message:', event.data)
        return
      }

      const message = event.data as SimpleMessage
      console.log('Message from APP:', message.action, message)

      // Handle message
      if (this.messageHandlers.has(message.action)) {
        const handler = this.messageHandlers.get(message.action)!
        try {
          handler(message.data)
        } catch (error) {
          console.error(`Error handling message action ${message.action}:`, error)
        }
      } else {
        console.warn(`No handler registered for action: ${message.action}`)
      }
    })
  }
}
