'use strict'
// @flow

import type { AmqpManagedConnection, PublishChannel } from './index'

// Given an AmqpManagedConnection, returns a Channel, which can be
// passed to consumeFrom or publishTo (see ./amqp.js)
export const createChannel:
  (connection: AmqpManagedConnection) => PublishChannel =
  connection => async setup =>
    connection.createChannel({ setup })
