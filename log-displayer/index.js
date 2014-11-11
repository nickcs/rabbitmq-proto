var amqp = require('amqp');

var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
    var options = {
      type: 'fanout',
      autoDelete: false
    }

    connection.exchange('logs', options, function(exchange){
        connection.queue('log-displayer', {exclusive: true}, function(queue){
            queue.bind('logs', '');
            console.log(' [*] Waiting for logs. To exit press CTRL+C')

            queue.subscribe(function(msg){
                console.log(" [x] %s", msg.message);
            });
        })
    });
});
