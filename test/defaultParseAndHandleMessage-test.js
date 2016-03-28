'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'

import defaultParseAndHandleMessage from '../src/defaultParseAndHandleMessage'

describe('defaultParseAndHandleMessage', () => {
  // TODO: This *should nack*, but see comments in parseAndHandleMessage
  // for why it (temporarily) acks instead.
  it('should call handleError and ack if message handling fails', () => {
    const content = JSON.stringify({ foo: 'bar' })
    const message = { content }

    let handleCount = 0
    const handleMessage = async (data) => {
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

    let handleErrorCount = 0
    const handleError = async (error) => {
      handleErrorCount++
      assert(error instanceof Error)
    }

    const parseAndHandle = defaultParseAndHandleMessage(handleError, handleMessage)

    return parseAndHandle(ack, nack, message)
      .then(() => {
        assert.equal(1, ackCount)
        assert.equal(1, handleCount)
        assert.equal(1, handleErrorCount)
      })
  })

  it('should ack if handleError fails', () => {
    const content = JSON.stringify({ foo: 'bar' })
    const message = { content }

    let handleCount = 0
    const handleMessage = async (data) => {
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

    let handleErrorCount = 0
    const handleError = async (error) => {
      handleErrorCount++
      assert(error instanceof Error)
      throw new Error()
    }

    const parseAndHandle = defaultParseAndHandleMessage(handleError, handleMessage)

    return parseAndHandle(ack, nack, message)
      .then(assert.ifError, () => {
        assert.equal(1, ackCount)
        assert.equal(1, handleCount)
        assert.equal(1, handleErrorCount)
      })
  })

  it('should call handleError and ack if parsing fails', () => {
    const content = undefined
    const message = { content }

    let handleCount = 0
    const handleMessage = async (data) => {
      handleCount++
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

    let handleErrorCount = 0
    const handleError = async (error) => {
      handleErrorCount++
      assert(error instanceof Error)
    }

    const parseAndHandle = defaultParseAndHandleMessage(handleError, handleMessage)

    return parseAndHandle(ack, nack, message)
      .then(() => {
        assert.equal(1, ackCount)
        assert.equal(0, handleCount)
        assert.equal(1, handleErrorCount)
      })
  })

  it('should ack if message handling succeeds', () => {
    const content = JSON.stringify({ foo: 'bar' })
    const message = { content }

    let handleCount = 0
    const handleMessage = async (data) => {
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

    let handleErrorCount = 0
    const handleError = async (e) => {
      handleErrorCount++
      throw e
    }

    const parseAndHandle = defaultParseAndHandleMessage(handleError, handleMessage)

    return parseAndHandle(ack, nack, message)
      .then(() => {
        assert.equal(1, ackCount)
        assert.equal(1, handleCount)
        assert.equal(0, handleErrorCount)
      })
  })
})
