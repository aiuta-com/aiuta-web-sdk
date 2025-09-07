import { MessageAction, MessageType } from './constants'

/**
 * Secure message structure used for all PostMessage communication
 */
export interface SecureMessage {
  version: string
  id: string
  timestamp: number
  type: MessageType
  action?: MessageAction
  data?: any
}

/**
 * Message handler function type
 */
export type MessageHandler = (message: SecureMessage, origin: string) => void | Promise<void>

/**
 * Message handler registration
 */
export interface MessageHandlerRegistration {
  action: MessageAction
  handler: MessageHandler
}

/**
 * Request/Response message types
 */
export interface RequestMessage extends SecureMessage {
  type: 'request'
  action: MessageAction
}

export interface ResponseMessage extends SecureMessage {
  type: 'response'
  id: string // Must match request ID
}

export interface EventMessage extends SecureMessage {
  type: 'event'
  action: MessageAction
}
