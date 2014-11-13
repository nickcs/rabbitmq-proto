var config = require('config'),
    amqp = require('amqp'),
    os = require('os')

var exchangeOptions = config.get('exchangeOptions'),
    subscriptionName = process.env.SUBNAME || config.get('subscriptionName'),
    publishingName = process.env.PUBNAME || config.get('publishingName')

var connection = amqp.createConnection({host: 'localhost'})

connection.on('ready', function(){
  connection.exchange(subscriptionName, exchangeOptions, function(exchange){
    connection.queue('agent-os-info', {exclusive: true}, function(queue){
      queue.bind(subscriptionName, '')
      console.log(' [*] Waiting for messages on ' + subscriptionName + '. To exit press CTRL+C')

      queue.subscribe(function(msg){
        console.log(' [x] Message received');
        msg.info = {
          hostname: os.hostname(),
          name: os.type(),
          platform: os.platform(),
          release: os.release(),
          uptme: os.uptime(),
          loadavg: os.loadavg(),
          totalmem: os.totalmem(),
          freemem: os.freemem(),
          cpus: os.cpus(),
          netinterfaces: os.networkInterfaces()
        }
        connection.exchange(publishingName, exchangeOptions, function(exchange){
          exchange.publish('', msg);
          console.log(' [x] Message sent');
        })
      })
    })
  })
})
