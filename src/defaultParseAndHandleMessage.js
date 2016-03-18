'use strict'
// @flow

import type { MessageHandler, MessageResultHandler, MessageContentHandler, JsonValue } from './index'

import parseAndHandleMessage from './parseAndHandleMessage'
import parseJsonMessage from './parseJsonMessage'

export default (handleMessage: MessageContentHandler<JsonValue, any>): MessageHandler => {
  // Generally, errors won't be recovered from
  // So default behavior here is always to ack, thus dropping failed messages,
  // rather than nacking, which can lead to infinite retries if not managed carefully
  const ackOnComplete: MessageResultHandler<any> = (ack, nack, message) => ack(message)
  return parseAndHandleMessage(parseJsonMessage('utf8'), ackOnComplete, ackOnComplete, handleMessage)
}
