'use strict'
/* @flow */

import type { MessageHandler } from './index'

const alwaysAck
  : (handleError:(err:Error) => mixed, f:(message:Object) => mixed) => MessageHandler =
  (handleError, f) => async (ack, _, message) => {
    try {
      await f(message)
    } catch (err) {
      await handleError(err)
    } finally {
      ack(message)
    }
  }

export default alwaysAck
