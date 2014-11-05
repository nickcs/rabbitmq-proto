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
  app.rabbitMqConnection = amqp.createConnection({ host: 'localhost' })
  app.rabbitMqConnection.on('ready', function(){
    status.connection = 'Connected!'

    app.e = app.rabbitMqConnection.exchange('test-exchange')
    status.exchange = 'The exchange is ready to use!'

    app.q = app.rabbitMqConnection.queue('test-queue')
    status.queue = 'The queue is ready for use!'

    app.q.bind(app.e, '#')

    app.q.subscribe(function(msg){
      console.dir(msg);
      // res.send(JSON.stringify(msg));
    });

    res.send(status)
  })
});

app.post('/new-message', function(req, res){
  var newMessage = req.body;
  app.e.publish('routingKey', newMessage);
  res.send();
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('RabbitMQ + Node.js app is running on port ' + app.get('port'));
});
