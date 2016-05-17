'use strict'
/* @flow */

type HandleError = (err:Error) => mixed
type HandleMessage<T:Object> = (message:T) => mixed
type AckMessage<T:Object> = (message:T) => void
type AmqpMiddleware<T:Object>
  = (ack:AckMessage<T>, nack:mixed, message:T) => Promise

const alwaysAck
  : (handleError:HandleError, f:HandleMessage) => AmqpMiddleware =
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
