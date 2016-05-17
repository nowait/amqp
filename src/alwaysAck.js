'use strict'
/* @flow */

import type { MessageHandler } from './index'

import { ackOnComplete, ackOnError } from './ackOn'
import parseAndHandleMessage from './parseAndHandleMessage'

export default (handleError:(e:mixed) => Promise<mixed>, f:(message:Object) => Promise<mixed>): MessageHandler =>
  parseAndHandleMessage(x => x, ackOnError(handleError), ackOnComplete, f)
