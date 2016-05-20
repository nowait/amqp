'use strict'
// @flow

import type { MessageHandler, MessageContentHandler, JsonValue } from './index'

import { ackOnComplete, ackOnError } from './ackOn'
import parseAndHandleMessage from './parseAndHandleMessage'
import parseJsonMessage from './parseJsonMessage'

// Generally, errors won't be recovered from
// So default behavior here is always to ack, thus dropping failed messages,
// rather than nacking, which can lead to infinite retries if not managed carefully
export default (handleError: (e:mixed) => Promise<mixed>, handleMessage: MessageContentHandler<JsonValue, mixed>): MessageHandler =>
  parseAndHandleMessage(parseJsonMessage('utf8'), ackOnError(handleError), ackOnComplete, handleMessage)
