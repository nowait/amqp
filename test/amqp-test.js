'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'
import { spy } from 'sinon'
import { assertQueue, assertExchange, consumeFrom, publishTo } from '../src/amqp'

const randomString = () => `${Math.random()}`

const assertSpyArgMatch = (matchers, args) => {
  for (let i = 0; i < matchers.length; ++i) {
    if (!matchers[i](args[i])) {
      throw new TypeError(`arg ${i} expected to match`)
    }
  }
}
const calledOnceWithArgs = (spy, ...matchers) =>
  spy.calledOnce && assertSpyArgMatch(matchers, spy.args[0])

const is = expected => actual => expected === actual
const isType = t => x => typeof x === t
const isFunction = isType('function')

class ChannelMock {
  constructor (message) {
    this.consume = spy((queueName, handler) => handler(message))
    this.publish = spy()
    this.ack = spy()
    this.nack = spy()

    this.assertExchange = spy()
    this.assertQueue = spy()
    this.bindQueue = spy()
  }
}

describe('amqp', () => {
  const randomConfig = () => {
    const exchangeName = randomString()
    const queueName = randomString()
    const routingKey = randomString()

    return { exchangeName, queueName, routingKey }
  }

  describe('assertQueue', () => {
    it('should assert exchange and queue, then bind queue', async () => {
      const config = randomConfig()
      const { exchangeName, queueName, routingKey } = config

      const channel = new ChannelMock()

      await assertQueue(config, channel)

      calledOnceWithArgs(channel.assertExchange, is(exchangeName), is('topic'), options => options.autoDelete === false)
      assert(channel.assertExchange.calledBefore(channel.assertQueue))
      assert(channel.assertQueue.calledBefore(channel.bindQueue))

      assert(channel.assertQueue.calledOnce)
      assert(channel.assertQueue.calledWithExactly(queueName))

      assert(channel.bindQueue.calledOnce)
      assert(channel.bindQueue.calledWithExactly(queueName, exchangeName, routingKey))
    })

    it('should return channel', async () => {
      const channel = new ChannelMock()

      const actual = await assertQueue(randomConfig(), channel)

      assert.strictEqual(channel, actual)
    })
  })

  describe('assertExchange', () => {
    it('should assert exchange and queue, then bind queue', async () => {
      const config = randomConfig()
      const { exchangeName } = config

      const channel = new ChannelMock()

      await assertExchange(config, channel)

      calledOnceWithArgs(channel.assertExchange, is(exchangeName), is('topic'), options => options.autoDelete === false)
      assert(channel.assertExchange.calledBefore(channel.assertQueue))
    })

    it('should return channel', async () => {
      const channel = new ChannelMock()

      const actual = await assertExchange(randomConfig(), channel)

      assert.strictEqual(channel, actual)
    })
  })

  describe('consumeFrom', () => {
    it('should consume from correct queue on the channel', async () => {
      const channel = new ChannelMock({})
      const queueName = randomString()

      const consume = consumeFrom(() => channel)
      await consume({ queueName }, () => {})

      calledOnceWithArgs(channel.consume, is(queueName), isFunction)
    })

    it('should call ack only when acking', async () => {
      const message = {}
      const channel = new ChannelMock(message)
      const consume = consumeFrom(() => channel)

      const handler = spy((ack, nack, msg) => ack(msg))
      await consume('', handler)

      calledOnceWithArgs(handler, isFunction, isFunction, is(message))
      assert(channel.ack.calledWithExactly(message))
      assert.strictEqual(0, channel.nack.callCount)
    })

    it('should call nack only when nacking', async () => {
      const message = {}
      const channel = new ChannelMock(message)
      const consume = consumeFrom(() => channel)

      const handler = spy((ack, nack, msg) => nack(msg))
      await consume('', handler)

      calledOnceWithArgs(handler, isFunction, isFunction, is(message))
      assert(channel.nack.calledWithExactly(message))
      assert.strictEqual(0, channel.ack.callCount)
    })
  })

  describe('publishTo', () => {
    it('should return a publisher function', () => {
      const publish = publishTo(() => {})(randomConfig())
      assert.strictEqual(typeof publish, 'function')
    })

    it('should publish to channel', async () => {
      const channel = new ChannelMock()
      const config = randomConfig()
      const { exchangeName, routingKey } = config

      const publish = publishTo(() => channel)(config)

      const message = randomString()

      await publish(message)

      calledOnceWithArgs(channel.publish, is(exchangeName), is(routingKey), buffer => buffer.toString() === message, options => options.persistent)
    })
  })
})
