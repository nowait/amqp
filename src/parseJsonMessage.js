'use strict'
// @flow

import type { MessageParser, JsonValue } from './index'

// Parse message buffer using specified encoding
const parseJsonMessage:
  (encoding: string) => MessageParser<JsonValue> =
  (encoding) => (message) => {
    // FIXME: casting to any here works around a flow bug where
    // passing a string-typed variable to Buffer toString() won't
    // typecheck (but passing a string *literal* will!)
    const enc: any = encoding
    return JSON.parse(message.content.toString(enc))
  }

export default parseJsonMessage
