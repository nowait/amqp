'use strict'
// @flow

import type {
  AmqpConnection, Channel, CreateChannel, AssertChannel, QueueConfig,
  MessageHandler, Publisher
} from './index'

// Given an AmqpConnection, returns a CreateChannel, which can be
// passed to consumeFrom or publishTo
export const createChannel
  : (connection:AmqpConnection|Promise<AmqpConnection>) => CreateChannel =
  connection => async setup => {
    const c = await connection
    return c.createChannel().then(setup)
  }

// Begin consuming messages from a queue with messageHandler
export const consumeFrom
  : (createChannel:CreateChannel) => (config:QueueConfig, messageHandler:MessageHandler) => Promise<{}> =
  createChannel => async (config, messageHandler) => {
    const channel = await initChannel(createChannel, assertChannel, config)
    const { queueName } = config

    const ack = message => channel.ack(message)
    const nack = message => channel.nack(message)
    const handleMessage = message => messageHandler(ack, nack, message)

    return channel.consume(queueName, handleMessage)
  }

// Create function which publishes messages to a queue
export const publishTo
  : (createChannel:CreateChannel) => (config:QueueConfig) => Publisher =
  (createChannel) => (config) => {
    const channel = initChannel(createChannel, assertChannel, config)

    return async (message) => {
      const ch = await channel
      const { exchangeName, routingKey } = config
      const messageBuffer = new Buffer(message, 'utf8')
      const options = {persistent: true}
      return ch.publish(exchangeName, routingKey, messageBuffer, options)
    }
  }

// Helper to create a channel and to setup exchange, queue, and routing key
export const initChannel
    : (createChannel:CreateChannel, assertChannel:AssertChannel, config:QueueConfig) => Promise<Channel> =
    (createChannel, assertChannel, config) =>
    createChannel(channel => assertChannel(config, channel))

// Helper to assert exchangeName, queueName, and bind queue with routing key
export const assertChannel: AssertChannel =
  async ({ exchangeName, queueName, routingKey }, channel) => {
    await channel.assertExchange(exchangeName, 'topic', { autoDelete: false })
    await channel.assertQueue(queueName)
    await channel.bindQueue(queueName, exchangeName, routingKey)

    return channel
  }
