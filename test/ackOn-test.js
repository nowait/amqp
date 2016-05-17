'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'
import { spy, match } from 'sinon'

import { ackOnComplete, ackOnError } from '../src/ackOn'

describe('ackOnComplete', () => {
  it('ack should be called with message', () => {
    const act = spy()
    const nack = spy()
    const message = {}

    ackOnComplete(act, nack, message)

    assert(act.calledWithExactly(match.same(message)))
    assert(nack.notCalled)
  })
})

describe('ackOnError', () => {
  it('handleErr should be called with err and ack should be called with message', async () => {
    const handleErr = spy(async () => {})
    const act = spy()
    const nack = spy()
    const message = {}
    const err = new Error()

    await ackOnError(handleErr)(act, nack, message, err)

    assert(handleErr.calledWithExactly(match.same(err)))
    assert(act.calledWithExactly(match.same(message)))
    assert(nack.notCalled)
  })
})
