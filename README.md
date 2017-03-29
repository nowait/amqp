# amqp

Simplified publish/subscribe and connection retry handling for amqp (rabbitmq).

This package integrates with [amqplib](http://www.squaremobius.net/amqp.node/channel_api.html) and [amqp-connection-manager](https://github.com/benbria/node-amqp-connection-manager) (which is also built on amqplib).  Use one of those packages to create connections that can be used with this package.

## Install

```
npm install @nowait/amqp --save
```

## Examples

### Create a Channel

First, create an AMQP connection, using either amqplib or amqp-connection-manager.  Then, create a channel.

#### Create duplex channel

Duplex channels are provided by amqplib, and can be used for either publishing or consuming messages.  They don't provide any fault tolerance for publishers: when connections are dropped, publishers will fail.

```js
import amqp from 'amqplib'
import { createChannel } from '@nowait/amqp'

// See amqplib documentation
// http://www.squaremobius.net/amqp.node/channel_api.html#connect
const connection = amqp.connect(uri, options)

const channel = createChannel(connection)
```

#### Create managed channel

Managed channels can only be used for event *publishers*.  They provide fault-tolerance by buffering events when the connection is dropped.  It will attempt to reconnect, and then deliver the buffered events.

```js
import amqpcm from 'amqp-connection-manager'
import { createManagedChannel } from '@nowait/amqp'

// See amqp-connection-mananger documentation
// https://github.com/benbria/node-amqp-connection-manager#basics
const connection = amqpcm.connect([...uri], options)

const channel = createManagedChannel(connection)
```

### Publish messages to an exchange

After creating a Channel, use `publishTo` to publish messages to an exchange using a routingKey.

```js
// Assuming channel was created using one of the approaches above

import { publishTo } from '@nowait/amqp'

const publishChannel = publishTo(channel)

const publishConfig = {
  exchangeName: 'some-exchange',
  routingKey: 'some-routing-key'
}

// Create a publisher function that will publish messages
// using the exchangeName and routingKey
const publish = publishChannel(publishConfig)

publish(JSON.stringify({ hello: 'world' }))
```

### Consume message from a queue

After creating a *duplex* Channel, use `consumeFrom` to consume messages from a queue.  This example uses `defaultParseAndHandleMessage`, which will convert messages from JSON format

```js
import amqp from 'amqplib'
import {
  createChannel, consumeFrom, defaultParseAndHandleMessage
} from '@nowait/amqp'

// See amqplib documentation
// http://www.squaremobius.net/amqp.node/channel_api.html#connect
const connection = amqp.connect(uri, options)

const channel = createChannel(connection)

const consume = consumeFrom(channel)

const consumeConfig = {
  exchangeName: 'some-exchange',
  queueName: 'some-queue',
  routingKey: 'some-routing-key'
}

const handleError = async (e, message) => {
  // message will be the raw AMQP message
  logError(e, message)
}

const handleMessage = defaultParseAndHandleMessage(handleError, (data) => {
  // Content will be the *parsed* message content.
  // Do something with it
  // IMPORTANT: Always return a promise to indicate
  // success or failure in handling the data
  return doBusinessLogic(data)
})

// Start consuming messages from the exchangeName, queueName,
// and routingKey.
consume(consumeConfig, handleMessage)
```

# API

## Types

### type PublishConfig = `{exchangeName: string, routingKey: string}`

Exchange and routingKey pair for setting up a publisher
Publishers don't care about queue names

### type ConsumeConfig = PublishConfig & `{queueName: string}`

Exchange, queue, and routingKey tuple for setting up a consumer

### type PublishChannel = Channel&lt;AmqpPublishChannel&gt;

A channel to which messages may be published

### type ConsumeChannel = Channel&lt;AmqpConsumeChannel&gt;

A channel from which messages may be consumed

### type DuplexChannel = Channel&lt;AmqpDuplexChannel&gt;

A channel that is both a PublishChannel and a ConsumeChannel

### type Publisher = string &rArr; Promise&lt;boolean&gt;

Message publishing function type returned by `publishTo`

## Functions

### createChannel : AmqpConnection &rArr; DuplexChannel

Create a Channel on a standard AmqpConnection (created with amqplib).  The Channel may be used to publish and/or publish messages.

### createManagedChannel : AmqpManagedConnection &rArr; PublishChannel

Create a Channel on an AmqpManagedConnection (created with amqp-connection-manager).  The Channel may only be used to publish messages.

### consumeFrom : ConsumeChannel &rArr; (ConsumeConfig, MessageHandler) &rArr; Promise&lt;{}&gt;

Begin consuming messages based on the exchangeName, queueName, and routingKey specified in ConsumeConfig

### publishTo : PublishChannel &rArr; PublishConfig &rArr; Publisher

Create a Publisher function which can be used to publish messages to an exchange and routingKey specified in the provided PublishConfig.

### parseAndHandleMessage : (MessageParser&lt;C&gt;, MessageResultHandler&lt;mixed&gt;, MessageResultHandler&lt;R&gt;, MessageContentHandler&lt;C, R&gt;) &rArr; MessageHandler

Base function for creating a MessageHandler to parse and handle consumed messages.  Most of the time, you'll want to use `defaultParseAndHandleMessage`.  Use this if you need to parse messages from a different format or handle Ack/Nack differently.

### defaultParseAndHandleMessage : (MessageErrorHandler&lt;Error, mixed&gt; &rArr; MessageContentHandler&lt;JsonValue, mixed&gt;) &rArr; MessageHandler&lt;mixed&gt;

Create a message handler that parses messages in JSON format, and automatically **acks** upon success or failed message handling. If an errors occurs during message parsing (e.g. invalid JSON) *or* message handling, the error and raw AMQP message will be passed to the error handler function.  The message will still be **acked** after the error handler returns.  If you need different error handling ack/nack behavior, use `parseAndHandleMessage`.

### parseJsonMessage : string &rArr; MessageParser&lt;JsonValue&gt;

Helper to create a MessageParser for messages in JSON format.
