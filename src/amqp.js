'use strict'
// @flow

// Unfortunately, eslint sees the imported types AmqpChannel,
// PublishChannel, and ConsumeChannel as symbols, but does *not*
// see their usages in type constraints. So, eslint will fail with a no-unused-var error, hence disabling it for the one line below.

import type {
  AmqpChannel, PublishChannel, ConsumeChannel, // eslint-disable-line no-unused-vars
  AmqpConnection, DuplexChannel, MessageHandler, Publisher,
  ExchangeConfig, PublishConfig, ConsumeConfig
} from './index'

// Given an AmqpConnection, returns a Channel, which can be
// passed to consumeFrom or publishTo
export const createChannel
  : (connection: AmqpConnection | Promise<AmqpConnection>) => DuplexChannel =
  connection => async setup => {
    const c = await connection
    return c.createChannel().then(setup)
  }

// Begin consuming messages from a queue with messageHandler
export function consumeFrom<C:ConsumeChannel> (channel: C): (config: ConsumeConfig, messageHandler: MessageHandler) => Promise<{}> {
  return async (config, messageHandler) => {
    const ch = await channel(amqpChannel => assertQueue(config, amqpChannel))
    const { queueName } = config

    const ack = message => ch.ack(message)
    const nack = message => ch.nack(message)
    const handleMessage = message => messageHandler(ack, nack, message)

    return ch.consume(queueName, handleMessage)
  }
}

// Create function which publishes messages to a queue
export function publishTo<C: PublishChannel> (channel: C): (config: PublishConfig) => Publisher {
  return function (config) {
    const chp = channel(amqpChannel => assertExchange(config, amqpChannel))

    return async (message) => {
      const ch = await chp
      const { exchangeName, routingKey } = config
      const messageBuffer = new Buffer(message, 'utf8')
      const options = {persistent: true}
      return ch.publish(exchangeName, routingKey, messageBuffer, options)
    }
  }
}

// Helper to assert exchangeName, queueName, and bind queue with routing key
export async function assertQueue<C:AmqpChannel> (config: ConsumeConfig, channel: C): Promise<C> {
  await assertExchange(config, channel)

  const { exchangeName, queueName, routingKey } = config

  await channel.assertQueue(queueName)
  await channel.bindQueue(queueName, exchangeName, routingKey)

  return channel
}

// Helper to assert exchangeName
export async function assertExchange<C: AmqpChannel> ({ exchangeName }: ExchangeConfig, channel: C): Promise<C> {
  await channel.assertExchange(exchangeName, 'topic', { autoDelete: false })

  return channel
}
