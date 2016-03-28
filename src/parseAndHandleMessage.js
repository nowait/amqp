'use strict'
// @flow

import type {
  MessageParser, MessageResultHandler, MessageHandler,
  MessageContentHandler
} from './index'

export default function parseAndHandleMessage<C, R> (
  parseMessage: MessageParser<C>,
  handleFailure: MessageResultHandler<mixed>,
  handleSuccess: MessageResultHandler<R>,
  handleMessage: MessageContentHandler<C, R>): MessageHandler {
  return async (ack, nack, message) => {
    try {
      // Step 1: Triage message
      const parsed = parseMessage(message)

      // Step 2: handle parsed message and success/failure
      const result = await handleMessage(parsed)
      return handleSuccess(ack, nack, message, result)
    } catch (e) {
      return handleFailure(ack, nack, message, e)
    }
  }
}
