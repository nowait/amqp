'use strict'
// @flow

import type { AmqpcmConnection, CreateChannel } from './index'

// Given an AmqpcmConnection, returns a CreateChannel, which can be
// passed to consumeFrom or publishTo (see ./amqp.js)
export const createChannel:
  (connection: AmqpcmConnection) => CreateChannel =
  connection => async setup =>
    connection.createChannel({ setup })
