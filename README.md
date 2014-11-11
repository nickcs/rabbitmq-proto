rabbitmq-proto
==============

AMQP Node prototype based on RabbitMQ

# Overview

This project includes a Vagrant setup that will install RabbitMQ and start a node application that has end points to push messages onto the message queue.  It also includes a sample microservice that connects to the message queue and echos the messages it detects to the console.

# Getting started

Start the server by running

```
vagrant up
```
Start the sample microserivce by opening a new terminal window and running

```
cd sample-microservice
npm start
```

# Server API

The server status can be checked by running
```
curl http://localhost:3000/status
```
The server will report the queue status as not established which is a known issue but not a problem.

To put a log message in the cue run
```
curl -X POST -H "Content-Type: application/json" -d '{"level":"error","message":"hello world"}' http://localhost:3000/emit-log
```
Once you have sent the log message you should see it on the console of the sample microservice.
