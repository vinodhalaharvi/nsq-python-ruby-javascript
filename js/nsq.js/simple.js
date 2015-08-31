var nsq = require('nsq.js');

// subscribe
var reader1 = nsq.reader({
    nsqd: [':4150'],
    maxInFlight: 1,
    maxAttempts: 1,
    topic: 'events',
    channel: 'ingestion'
});

reader1.on('message', function(msg){
    var body = msg.body.toString();
    console.log('%s on id=%d', body, 0);
    msg.requeue(200);
});

// subscribe
var reader2 = nsq.reader({
    nsqd: [':4150'],
    maxInFlight: 5,
    maxAttempts: 1,
    topic: 'events',
    channel: 'ingestion'
});

reader2.on('message', function(msg){
    var body = msg.body.toString();
    console.log('%s on id=%d', body, 1);
    msg.requeue(200);
});

// publish
var writer = nsq.writer(':4150');
writer.on('ready', function() {
    for (var i = 0, len = 10000; i < len; i++) {
        writer.publish('events', 
                       Math.random(16).toString().slice(2) + " " + i);
    }
});
