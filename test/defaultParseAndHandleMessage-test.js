'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'

import defaultParseAndHandleMessage from '../src/defaultParseAndHandleMessage'

describe('defaultParseAndHandleMessage', () => {
  // TODO: This *should nack*, but see comments in parseAndHandleMessage
  // for why it (temporarily) acks instead.
  it('should ack if message handling fails', () => {
    const content = JSON.stringify({ foo: 'bar' })
    const message = { content }

    let handleCount = 0
    const handle = async (data) => {
      handleCount++
      assert.equal(content, JSON.stringify(data))
      throw new Error()
    }

    let ackCount = 0
    const ack = msg => {
      ackCount++
      assert.strictEqual(message, msg)
    }

    const nack = () => {
      throw new Error('should not nack')
    }

    const parseAndHandle = defaultParseAndHandleMessage(handle)

    return parseAndHandle(ack, nack, message)
      .then(() => {
        assert.equal(1, ackCount)
        assert.equal(1, handleCount)
      })
  })

  it('should ack if message handling succeeds', () => {
    const content = JSON.stringify({ foo: 'bar' })
    const message = { content }

    let handleCount = 0
    const handle = async (data) => {
      handleCount++
      assert.equal(content, JSON.stringify(data))
      return data
    }

    let ackCount = 0
    const ack = msg => {
      ackCount++
      assert.strictEqual(message, msg)
    }

    const nack = () => {
      throw new Error('should not nack')
    }

    const parseAndHandle = defaultParseAndHandleMessage(handle)

    return parseAndHandle(ack, nack, message)
      .then(() => {
        assert.equal(1, ackCount)
        assert.equal(1, handleCount)
      })
  })
})
