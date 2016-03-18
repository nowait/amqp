'use strict'

import { describe, it } from 'mocha'
import assert from 'assert'
import { createChannel } from '../src/amqpcm'

describe('amqpcm', () => {
  describe('createChannel', () => {
    it('should use connection to create channel', async () => {
      const expected = {}
      const connection = { createChannel: async ({ setup }) => setup }

      const actual = await createChannel(connection)(expected)

      assert.strictEqual(expected, actual)
    })
  })
})
