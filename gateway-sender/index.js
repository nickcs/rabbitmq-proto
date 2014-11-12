var config = require('config')
var amqp = require('amqp')
var request = require('request')

var connection = amqp.createConnection({host: 'localhost'})

connection.on('ready', function(){
  var options = {
    type: 'fanout',
    autoDelete: false
  }

  var inboundExchange = config.get('inboundExchange')
  if (inboundExchange && inboundExchange.length > 0) {
    connection.exchange(inboundExchange, options, function(exchange){
      connection.queue('gateway-sender', {exclusive: true}, function(queue){
        queue.bind(inboundExchange, '')
        console.log(' [*] Waiting for messages on ' + inboundExchange + '. To exit press CTRL+C')

        queue.subscribe(function(msg){
          console.log(' [x] Message received');
          request({
            method: 'POST',
            uri: config.get('endpoint'),
            json: true,
            body: msg
          }, function(err,res,body){
            if (err) {
              console.log(' [!] Error sending message: ' + err);
            } else {
              console.log(' [X] Message sent');
            }
          })
        })
      })
    })
  }
})
