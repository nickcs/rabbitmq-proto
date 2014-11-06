var express = require('express'),
    http = require('http'),
    path = require('path'),
    amqp = require('amqp'),
    bodyParser = require('body-parser')

var status = {
  connection: 'No server connection',
  exchange: 'No exchange established',
  queue: 'No queue established'
}

var app = express()

app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json())

app.post('/start-server', function(req, res){
  app.amqpConnection = amqp.createConnection({ host: 'localhost' })
  // Wait for connection to become established.
  app.amqpConnection.on('ready', function () {
    status.connection = 'Connection is ready';

    var options = {
      type: 'fanout',
      autoDelete: false
    }

    app.amqpConnection.exchange('logs', options, function(exchange){
      app.amqpExchange = exchange;
      status.exchange = 'Exchange is ready';
      res.send(status);
    });
  });
});

app.post('/emit-log', function(req, res){
  var newMessage = req.body;
  console.dir(newMessage);
  console.log('log message level: ' + newMessage.level + ' body: ' + newMessage.message);
  app.amqpExchange.publish('', newMessage.message);
  res.send('message sent');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('RabbitMQ + Node.js app is running on port ' + app.get('port') + '. To exit press CTRL+C');
});
