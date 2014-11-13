var config = require('config'),
    express = require('express'),
    http = require('http'),
    url = require('url'),
    amqp = require('amqp'),
    bodyParser = require('body-parser')

var exchangeOptions = config.get('exchangeOptions'),
    port = process.env.PORT || config.get('port')

var status = {
  connection: 'No server connection',
  lastExchange: 'No exchange established'
}

var app = express()

app.set('port', port)

app.use(bodyParser.json())

app.get('/status', function(req, res){
    res.send(status)
})

app.post('/*', function(req, res){
  var path = url.parse(req.url).pathname.substring(1);
  var newMessage = req.body;

  console.log('message received for exchange: ' + path);

  app.amqpConnection.exchange(path, exchangeOptions, function(exchange){
    status.lastExchange = 'Last exchange used: ' + path;
    status.lastMessage = newMessage;
    exchange.publish('', newMessage);
    res.send();
  })
})

app.amqpConnection = amqp.createConnection({ host: 'localhost' })
// Wait for connection to become established.
app.amqpConnection.on('ready', function () {
  status.connection = 'Connection is ready';
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('http-publisher is running on port ' + app.get('port') + '. To exit press CTRL+C');
})
