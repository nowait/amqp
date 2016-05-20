'use strict'
/* @flow */

import type { MessageResultHandler } from './index'

export const ackOnComplete: MessageResultHandler<mixed> = (ack, nack, message) =>
  ack(message)

export const ackOnError = (handleError: (e:mixed) => Promise<mixed>) : MessageResultHandler<mixed> => async (ack, nack, message, e) => {
  try {
    await handleError(e)
  } finally {
    ack(message)
  }
}
