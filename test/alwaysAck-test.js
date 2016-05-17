'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'
import { spy } from 'sinon'

import alwaysAck from '../src/alwaysAck'

describe('alwaysAck', () => {
  it('should call `ack` if message handler succeeds', async () => {
    const message = {}
    const handleMessage = spy()
    const handleError = spy()
    const ack = spy()
    const nack = spy()

    const middleware = alwaysAck(handleError, handleMessage)

    await middleware(ack, nack, message)

    assert(handleMessage.calledWithExactly(message))
    assert(ack.calledWithExactly(message))
    assert(nack.notCalled)
    assert(handleError.notCalled)
  })

  it('should call `ack` if message handler throws', async () => {
    const message = {}
    const err = new Error()
    const handleMessage = spy(() => {
      throw err
    })
    const handleError = spy()
    const ack = spy()
    const nack = spy()

    const middleware = alwaysAck(handleError, handleMessage)

    await middleware(ack, nack, message)

    assert(handleMessage.calledWithExactly(message))
    assert(ack.calledWithExactly(message))
    assert(nack.notCalled)
    assert(handleError.calledWithExactly(err))
  })
})
