'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'

import defaultParseAndHandleMessage from '../src/defaultParseAndHandleMessage'

const verifyMessageHandling = (handleError, handleMessage, content) => {
  const message = { content }

  let handleCount = 0
  const _handleMessage = async (data) => {
    handleCount++
    return handleMessage(data)
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
  const _handleError = async (e) => {
    handleErrorCount++
    return handleError(e)
  }

  const parseAndHandle = defaultParseAndHandleMessage(_handleError, _handleMessage)

  return parseAndHandle(ack, nack, message)
    .then(
      () => ({ ackCount, handleCount, handleErrorCount }),
      () => Promise.reject({ ackCount, handleCount, handleErrorCount })
    )
}

const verifyCounts = (expectedAckCount, expectedHandleCount, expectedHandleErrorCount) =>
  ({ ackCount, handleCount, handleErrorCount }) => {
    assert.equal(expectedAckCount, ackCount)
    assert.equal(expectedHandleCount, handleCount)
    assert.equal(expectedHandleErrorCount, handleErrorCount)
  }

describe('defaultParseAndHandleMessage', () => {
  // TODO: This *should nack*, but see comments in parseAndHandleMessage
  // for why it (temporarily) acks instead.
  it('should call handleError and ack if message handling fails', () => {
    const content = JSON.stringify({ foo: 'bar' })

    const handleError = async (error) => {
      assert(error instanceof Error)
    }

    const handleMessage = async (data) => {
      assert.equal(content, JSON.stringify(data))
      throw new Error()
    }

    return verifyMessageHandling(handleError, handleMessage, content)
      .then(verifyCounts(1, 1, 1))
  })

  it('should ack if handleError fails', () => {
    const content = JSON.stringify({ foo: 'bar' })

    const handleError = async (error) => {
      assert(error instanceof Error)
      throw new Error()
    }

    const handleMessage = async (data) => {
      assert.equal(content, JSON.stringify(data))
      throw new Error()
    }

    return verifyMessageHandling(handleError, handleMessage, content)
      .then(assert.ifError, verifyCounts(1, 1, 1))
  })

  it('should call handleError and ack if parsing fails', () => {
    const content = undefined

    const handleError = async (error) => {
      assert(error instanceof Error)
    }

    const handleMessage = async (data) => {
      throw new Error()
    }

    return verifyMessageHandling(handleError, handleMessage, content)
      .then(verifyCounts(1, 0, 1))
  })

  it('should ack if message handling succeeds', () => {
    const content = JSON.stringify({ foo: 'bar' })

    const handleError = async (e) => {
      throw e
    }

    const handleMessage = async (data) => {
      assert.equal(content, JSON.stringify(data))
      return data
    }

    return verifyMessageHandling(handleError, handleMessage, content)
      .then(verifyCounts(1, 1, 0))
  })
})
