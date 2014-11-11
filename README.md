rabbitmq-proto
==============

AMQP Node prototype based on RabbitMQ

# Overview

This project illustrates the use of [Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-python.html) with RabbitMQ in Node.  It is a logging system with the following elements:

* Express server with an end point that can receive log messages in json format and put them in the message queue to be processed by any interested service
* A microservice that displays all log messages to the console
* A microservice that receives all log messsages and displays them to the console and writes them to a log file


# Getting started

Start the server by running
```
vagrant up
```
To start the log displayer microservice run

```
cd log-displayer
npm start
```
To start the log writer microservice run
```
cd log-writer
npm start
```

# Server API

The server status can be checked by running
```
curl http://localhost:3000/status
```

To put a log message in the queue run
```
curl -X POST -H "Content-Type: application/json" -d '{"level":"error","message":"hello world"}' http://localhost:3000/emit-log
```
Once you have sent the log message you should see it on the console of the microservices.
