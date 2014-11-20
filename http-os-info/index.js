var config = require('config'),
    _ = require('underscore'),
    express = require('express'),
    http = require('http'),
    amqp = require('amqp'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    LRU = require('lru-cache')

var exchangeOptions = config.get('exchangeOptions'),
    subscriptionName = process.env.SUBNAME || config.get('subscriptionName'),
    publishingName = process.env.PUBNAME || config.get('publishingName'),
    cacheSize = config.get('cacheSize'),
    port = process.env.PORT || config.port

var requests = LRU({
  max: cacheSize,
  maxAge: 60e3
})

var app = express()

function publishMessage(res, exchange) {
  request = {
    id: uuid.v4(),
    response: res
  }
  requests.set(request.id, request);
  exchange.publish('', {id: request.id});
  console.log(' [x] ' + publishingName + ' message sent');

  setTimeout(function(){
    if (!res.headersSent) res.sendStatus(408)
  }, 30e3)
}

function listenToUpstream() {
  app.amqpConnection.exchange(subscriptionName, exchangeOptions, function(exchange){
      app.amqpConnection.queue('http-os-info', {exclusive: true}, function(queue){
          queue.bind(subscriptionName, '');
          console.log(' [*] Waiting for ' + subscriptionName + '. To exit press CTRL+C')

          queue.subscribe(function(msg){
            console.log(' [x] ' + subscriptionName + ' message received')
            requests.get(msg.id).response.send(msg)
          });
      })
  });
}

app.set('port', port)
app.use(bodyParser.json())

app.get('/', function(req, res){
  console.log(' [^] Request received');
  app.amqpConnection.exchange(publishingName, exchangeOptions, _.partial(publishMessage,res))
})

app.amqpConnection = amqp.createConnection({ host: 'localhost' })
app.amqpConnection.on('ready', listenToUpstream)

http.createServer(app).listen(app.get('port'), function(){
  console.log('http-os-info is running on port ' + app.get('port') + '. To exit press CTRL+C');
})
