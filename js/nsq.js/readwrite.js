var nsq = require('nsq.js');
var readers = []; 

for (var i = 0, len = 2; i < len; i++) {
    readers[i] = nsq.reader({
        nsqd: [':4150'],
        maxInFlight: 1 + i*5 ,
        maxAttempts: 1,
        topic: 'events',
        channel: 'ingestion' + i, 
    });
}

//readers.forEach(function(reader){
readers[0].on('message', function(msg){
    var body = msg.body.toString();
    console.log('recieved on %d:  %s', 0, body); 
});
readers[0].on('discard', function(msg){
    var body = msg.body.toString();
    console.log('giving up on %d:  %s', 0, body);
    msg.finish();
});
readers[0].on('error', function(err){
    console.log('error on %d:  %s', 0, body);
    console.log(err.stack);
});


//readers.forEach(function(reader){
readers[1].on('message', function(msg){
    var body = msg.body.toString();
    console.log('recieved on %d:  %s', 1, body); 
});
readers[1].on('discard', function(msg){
    var body = msg.body.toString();
    console.log('giving up on %d:  %s', 1, body);
    msg.finish();
});
readers[1].on('error', function(err){
    console.log('error on %d:  %s', 1, body);
    console.log(err.stack);
});


// publish
var writer = nsq.writer(':4150');
writer.on('ready', function() {
    for (var i = 0, len = 100; i < len; i++) {
        writer.publish('events', 
                       Math.random(16).toString().slice(3) + "-" + i);
    }
});
