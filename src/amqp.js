'use strict'
// @flow

// Unfortunately, eslint sees the imported type AmqpChannel as a symbol,
// but does *not* see its usage in the type constraint of assertChannel.
// So, eslint will fail with a no-unused-var error, hence disabling it for
// the one line below.

import type {
  AmqpChannel, // eslint-disable-line no-unused-vars
  AmqpConnection, PublishChannel, ConsumeChannel, DuplexChannel,
  QueueConfig, MessageHandler, Publisher
} from './index'

// Given an AmqpConnection, returns a Channel, which can be
// passed to consumeFrom or publishTo
export const createChannel
  : (connection:AmqpConnection|Promise<AmqpConnection>) => DuplexChannel =
  connection => async setup => {
    const c = await connection
    return c.createChannel().then(setup)
  }

// Begin consuming messages from a queue with messageHandler
export const consumeFrom
  : (channel:ConsumeChannel) => (config:QueueConfig, messageHandler:MessageHandler) => Promise<{}> =
  channel => async (config, messageHandler) => {
    const ch = await channel(amqpChannel => assertChannel(config, amqpChannel))
    const { queueName } = config

    const ack = message => ch.ack(message)
    const nack = message => ch.nack(message)
    const handleMessage = message => messageHandler(ack, nack, message)

    return ch.consume(queueName, handleMessage)
  }

// Create function which publishes messages to a queue
export const publishTo
  : (channel:PublishChannel) => (config:QueueConfig) => Publisher =
  (channel) => (config) => {
    const chp = channel(amqpChannel => assertChannel(config, amqpChannel))

    return async (message) => {
      const ch = await chp
      const { exchangeName, routingKey } = config
      const messageBuffer = new Buffer(message, 'utf8')
      const options = {persistent: true}
      return ch.publish(exchangeName, routingKey, messageBuffer, options)
    }
  }

// Helper to assert exchangeName, queueName, and bind queue with routing key
export async function assertChannel<C:AmqpChannel> ({ exchangeName, queueName, routingKey }: QueueConfig, channel: C): Promise<C> {
  await channel.assertExchange(exchangeName, 'topic', { autoDelete: false })
  await channel.assertQueue(queueName)
  await channel.bindQueue(queueName, exchangeName, routingKey)

  return channel
}
