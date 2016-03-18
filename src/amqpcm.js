'use strict'
// @flow

import type { AmqpManagedConnection, Channel } from './index'

// Given an AmqpcmConnection, returns a CreateChannel, which can be
// passed to consumeFrom or publishTo (see ./amqp.js)
export const createChannel:
  (connection: AmqpManagedConnection) => Channel =
  connection => async setup =>
    connection.createChannel({ setup })
