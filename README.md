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

### Publish messages to a queue

After creating a Channel, use `publishTo` to publish messages to a queue.

```js
// Assuming channel was created using one of the approaches above

const publishChannel = publishTo(channel)

const queueConfig = {
  exchangeName: 'some-exchange',
  queueName: 'some-queue',
  routingKey: 'some-routing-key'
}

// Create a publisher function that will publish messages
// using the exchangeName, queueName, and routingKey
const publisher = publishChannel(queueConfig)

publisher(JSON.stringify({ hello: 'world' }))
```

### Consume message from a queue

After creating a *duplex* Channel, use `consumeFrom` to consume messages from a queue.  This example uses `defaultParseAndHandleMessage`, which will convert messages from JSON format

```js
import amqp from 'amqplib'
import { createChannel } from '@nowait/amqp'

// See amqplib documentation
// http://www.squaremobius.net/amqp.node/channel_api.html#connect
const connection = amqp.connect(uri, options)

const channel = createChannel(connection)

const consume = consumeFrom(channel)

const queueConfig = {
  exchangeName: 'some-exchange',
  queueName: 'some-queue',
  routingKey: 'some-routing-key'
}

const handler = defaultParseAndHandleMessage((data) => {
  // Content will be the *parsed* message content.
  // Do something with it
  // IMPORTANT: Always return a promise to indicate
  // success or failure in handling the data
  return doBusinessLogic(data)
})

// Start consuming messages from the exchangeName, queueName,
// and routingKey.
consume(queueConfig, handler)
```

## API

### createChannel : AmqpConnection &rArr; DuplexChannel

Create a Channel on a standard AmqpConnection (created with amqplib).  The Channel may be used to publish and/or publish messages.

### createManagedChannel : AmqpManagedConnection &rArr; PublishChannel

Create a Channel on an AmqpManagedConnection (created with amqp-connection-manager).  The Channel may only be used to publish messages.

### consumeFrom : Channel &rArr; (QueueConfig, MessageHandler) &rArr; Promise<{}>

### publishTo : Channel &rArr; QueueConfig &rArr; Publisher

**type Publisher = string &rArr Promise<boolean>**

### parseAndHandleMessage : MessageParser<C> &rArr; MessageResultHandler<mixed> &rArr; MessageResultHandler<R> &rArr; MessageContentHandler<C, R> &rArr; MessageHandler

**type MessageHandler<R> = (ack:Ack, nack:Nack, message:Message) &rArr Promise<R>**

### defaultParseAndHandleMessage : MessageContentHandler<JsonValue, mixed> &rArr; MessageHandler<mixed>

### parseJsonMessage : string &rArr; MessageParser<JsonValue>
