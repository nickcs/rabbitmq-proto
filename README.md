# rabbitmq-proto

AMQP Node prototype based on RabbitMQ

## Overview

This project illustrates the use of [Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-python.html) with RabbitMQ in Node.  It combines the use of several microservices in different ways to provide different solutions.  


## Basic deployment

The basic deployment offers a logging system with the following elements:

* Express server with an end point that can receive log messages in json format and put them in the message queue to be processed by the loggig service
* A microservice that receives all log messsages and displays them to the console and writes them to a log file

### Getting started

Start the server by running
```
vagrant up edge
```
To start the log writer microservice run
```
vagrant ssh edge
cd /vagrant/log-writer
npm start
```

### Server API

The server status can be checked by running
```
curl http://localhost:3000/status
```

To put a log message in the queue run
```
curl -X POST -H "Content-Type: application/json" -d '{"level":"error","message":"hello world"}' http://localhost:3000/logs
```
Once you have sent the log message you should see it on the console of the logging microservice.

## Local O/S agent deployment

This deployment offers an application where a request can be sent to the server and it will provide o/s related information as a JSON result.

### Getting started

Make sure you have stopped any Microservices running from previous examples. If you haven't already started the edge server, start it by running
```
vagrant up edge
```
Need to start a new HTTP server that listens for O/S info requests
```
vagrant ssh edge
cd /vagrant/http-os-info
npm start
```

To start the O/S info microservice run
```
vagrant ssh edge
cd /vagrant/agent-os-info
npm start
```

### Server API

To request the server O/S info run
```
curl http://localhost:3001
```
This will return a variety of O/S info in JSON.

## Distribute O/S agent deploymnt

Let's kick it up a notch and combine some services we have already used with a new one to give a solution that will send a request to a remote server for it's O/S info and return it.

### Getting started

Make sure you have stopped any Microservices running from previous examples. If you haven't already started the edge server, start it by running
```
vagrant up edge
```
Need to start the HTTP server that listens for O/S info requests
```
vagrant ssh edge
cd /vagrant/http-os-info
npm start
```
Next we need to start the gateway-sender service that will pass requests sent to the downstream exchange to a remote server.  This server will be the one that will being providing the O/S info
```
vagrant ssh edge
cd /vagrant/gateway-sender
npm start
```
Now we need to start the remote server if it isn't arleady running
```
vagrant up internal
```
We will need to start the O/S agent on the remote server
```
vagrant ssh internal
cd /vagrant/agent-os-info
npm start
```
Starting the service to push the agent results back using the upstream exchange
```
vagrant ssh internal
cd /vagrant/gateway-sender
NODE_ENV=upstream npm start
```

### API

To request the server O/S info run
```
curl http://localhost:3001
```
This will return a variety of O/S info in JSON from the remote server named "internal".  This happens as a result of the following steps:

1. The http-os-info service accepts an http request and posts a message on the downstream exchange
2. The gateway-sender service picks up the downstream message and passes it to the remote server
3. The http-publisher service running on the remote server publishes the request on the queue
4. The agent-os-info service processes the request and places the result on an upstream exchange
5. The gateway-sender running on the remote server takes the upstream message and sends it to the calling server
6. The http-publisher on the calling server accepts the upstream request and publishes it to the queue
7. The http-os-info service picks up the upstream request and returns the result to the caller
