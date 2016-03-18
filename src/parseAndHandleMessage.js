'use strict'
// @flow

import type {
  MessageParser, MessageResultHandler, MessageHandler,
  MessageContentHandler
} from './index'

export default function parseAndHandleMessage<C, R> (
  parseMessage: MessageParser<C>,
  handleFailure: MessageResultHandler<any>,
  handleSuccess: MessageResultHandler<R>,
  handleMessage: MessageContentHandler<C, R>): MessageHandler {
  return async (ack, nack, message) => {
    try {
      // Step 1: Triage message
      // If we can't do this, log error, drop message, continue.
      // Don't crash
      const parsed = parseMessage(message)

      // Step 2: handle parsed message and success/failure
      return handleMessage(parsed)
        .then(
          result => handleSuccess(ack, nack, message, result),
          error => handleFailure(ack, nack, message, error)
        )
    } catch (e) {
      return handleFailure(ack, nack, message, e)
    }
  }
}
