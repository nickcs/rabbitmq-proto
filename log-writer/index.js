var amqp = require('amqp');
var winston = require('winston');

var connection = amqp.createConnection({host: 'localhost'});

winston.add(winston.transports.File, {filename: 'logfile.log'});

connection.on('ready', function(){
    var options = {
      type: 'fanout',
      autoDelete: false
    }

    connection.exchange('logs', options, function(exchange){
        connection.queue('log-writer', {exclusive: true}, function(queue){
            queue.bind('logs', '');
            console.log(' [*] Waiting for logs. To exit press CTRL+C')

            queue.subscribe(function(msg){
              winston.log(msg.level, msg.message);
            });
        })
    });
});
