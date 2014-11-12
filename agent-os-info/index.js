var config = require('config')
var amqp = require('amqp')
var os = require('os')

var connection = amqp.createConnection({host: 'localhost'})

connection.on('ready', function(){
  var options = {
    type: 'fanout',
    autoDelete: false
  }

  var inboundExchange = config.get('inboundExchange')
  var outboundExchange = config.get('outboundExchange')

  if (inboundExchange && inboundExchange.length > 0) {
    connection.exchange(inboundExchange, options, function(exchange){
      connection.queue('agent-os-info', {exclusive: true}, function(queue){
        queue.bind(inboundExchange, '')
        console.log(' [*] Waiting for messages on ' + inboundExchange + '. To exit press CTRL+C')

        queue.subscribe(function(msg){
          console.log(' [x] Message received');
          var info = {
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
          connection.exchange(outboundExchange, options, function(exchange){
            exchange.publish('', info);
            console.log(' [x] Message sent');
            console.dir(info);
          })
        })
      })
    })
  }
})
