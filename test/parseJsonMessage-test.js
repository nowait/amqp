'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'

import { Buffer } from 'buffer'

import parseJsonMessage from '../src/parseJsonMessage'

describe('parseJsonMessage', () => {
  it('should parse JSON content', () => {
    const encoding = 'utf8'
    const expected = { foo: 'bar' }
    const content = new Buffer(JSON.stringify(expected), encoding)

    const parse = parseJsonMessage(encoding)

    const actual = parse({ content })

    assert.deepEqual(expected, actual)
  })

  it('should throw if content is not valid JSON', () => {
    const encoding = 'utf8'
    const content = new Buffer('invalid', encoding)

    const parse = parseJsonMessage(encoding)

    assert.throws(() => parse({ content }), SyntaxError)
  })

  it('should throw if encoding is incompatible', () => {
    const content = new Buffer(JSON.stringify({}), 'utf8')

    const parse = parseJsonMessage('base64')

    assert.throws(() => parse({ content }), Error)
  })
})
