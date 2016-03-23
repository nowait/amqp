'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'

import parseAndHandleMessage from '../src/parseAndHandleMessage'

const fail = (...args) => { throw new Error(args) }
const captureHandlerArgs = (ack, nack, message, result) => ({ ack, nack, message, result })

describe('parseAndHandleMessage', () => {
  it('should call handleFailure with parse error if parsing fails', async () => {
    const expected = new Error()

    const failParse = () => { throw expected }

    const handle = parseAndHandleMessage(failParse, captureHandlerArgs, fail, fail)

    const expectedAck = () => {}
    const expectedNack = () => {}
    const expectedMessage = {}

    const { ack, nack, message, result } = await handle(expectedAck, expectedNack, expectedMessage)

    assert.strictEqual(expectedAck, ack)
    assert.strictEqual(expectedNack, nack)
    assert.strictEqual(expectedMessage, message)
    assert.strictEqual(expected, result)
  })

  it('should call handleMessage if parsing succeeds', async () => {
    const parse = (x) => x
    const handleMessage = (x) => Promise.resolve(x)

    const handle = parseAndHandleMessage(parse, fail, captureHandlerArgs, handleMessage)

    const expectedAck = () => {}
    const expectedNack = () => {}
    const expectedMessage = {}

    const { ack, nack, message, result } = await handle(expectedAck, expectedNack, expectedMessage)

    assert.strictEqual(expectedAck, ack)
    assert.strictEqual(expectedNack, nack)
    assert.strictEqual(expectedMessage, message)
    assert.strictEqual(expectedMessage, result)
  })

  it('should call handleFailure with failed handleMessage error', async () => {
    const parse = (x) => x
    const handleMessage = (x) => Promise.reject(x)

    const handle = parseAndHandleMessage(parse, captureHandlerArgs, fail, handleMessage)

    const expectedAck = () => {}
    const expectedNack = () => {}
    const expectedMessage = {}

    const { ack, nack, message, result } = await handle(expectedAck, expectedNack, expectedMessage)

    assert.strictEqual(expectedAck, ack)
    assert.strictEqual(expectedNack, nack)
    assert.strictEqual(expectedMessage, message)
    assert.strictEqual(expectedMessage, result)
  })
})
