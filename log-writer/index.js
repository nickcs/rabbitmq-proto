var config = require('config'),
    amqp = require('amqp'),
    winston = require('winston')

var exchangeOptions = config.get('exchangeOptions'),
    subscriptionName = process.env.SUBNAME || config.get('subscriptionName'),
    host = process.env.HOST || config.get('host')

var connection = amqp.createConnection({host: host});

winston.add(winston.transports.File, {filename: subscriptionName + '.log'});

connection.on('ready', function(){
  connection.exchange(subscriptionName, exchangeOptions, function(exchange){
    connection.queue('log-writer', {exclusive: true}, function(queue){
      queue.bind(subscriptionName, '');
      console.log(' [*] Waiting for logs. To exit press CTRL+C')

      queue.subscribe(function(msg){
        if (msg.level) {
          winston.log(msg.level, msg.message);
        } else {
          winston.log('info', msg);
        }
      });
    })
  });
});
