var express = require('express'),
    http = require('http'),
    amqp = require('amqp'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    _ = require('underscore')

var exchangeOptions = {
  type: 'fanout',
  autoDelete: false
}

var app = express()

var requests = []

function publishMessage(res, exchange) {
  request = {
    id: uuid.v4(),
    response: res
  }
  requests.push(request);
  exchange.publish('', {id: request.id});
  console.log(' [x] Downstream message sent');
}

function listenToUpstream() {
  app.amqpConnection.exchange('upstream', exchangeOptions, function(exchange){
      app.amqpConnection.queue('log-displayer', {exclusive: true}, function(queue){
          queue.bind('upstream', '');
          console.log(' [*] Waiting for upstream. To exit press CTRL+C')

          queue.subscribe(function(msg){
            console.log(' [x] Upstream message received')
            _.findWhere(requests,{id: msg.id}).response.send(msg);
          });
      })
  });
}

app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json())

app.get('/', function(req, res){
  console.log(' [^] Request received');
  app.amqpConnection.exchange('downstream', exchangeOptions, _.partial(publishMessage,res))
})

app.amqpConnection = amqp.createConnection({ host: 'localhost' })
app.amqpConnection.on('ready', listenToUpstream)

http.createServer(app).listen(app.get('port'), function(){
  console.log('http-os-info is running on port ' + app.get('port') + '. To exit press CTRL+C');
})
