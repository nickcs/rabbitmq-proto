var config = require('config')
var amqp = require('amqp')
var request = require('request')

var connection = amqp.createConnection({host: 'localhost'})

connection.on('ready', function(){
  var options = {
    type: 'fanout',
    autoDelete: false
  }

  var exchangeName = config.get('exchangeName')
  if (exchangeName && exchangeName.length > 0) {
    connection.exchange(exchangeName, options, function(exchange){
      connection.queue('gateway-sender', {exclusive: true}, function(queue){
        queue.bind(exchangeName, '')
        console.log(' [*] Waiting for messages on ' + exchangeName + '. To exit press CTRL+C')

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
