var config = require('config'),
    amqp = require('amqp'),
    request = require('request')

var exchangeOptions = config.get('exchangeOptions'),
    subscriptionName = process.env.SUBNAME || config.get('subscriptionName')

var connection = amqp.createConnection({host: 'localhost'})

connection.on('ready', function(){
  connection.exchange(subscriptionName, exchangeOptions, function(exchange){
    connection.queue('gateway-sender', {exclusive: true}, function(queue){
      queue.bind(subscriptionName, '')
      console.log(' [*] Waiting for messages on ' + subscriptionName + '. To exit press CTRL+C')

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
})
