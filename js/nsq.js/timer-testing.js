var nsq = require('nsq.js');
// subscribe
var r1 = nsq.reader({
    nsqd: [':4150'],
    maxInFlight: 20,
    maxAttempts: 5,
    topic: 'events',
    channel: 'ingestion'
});

// publish
var writer = nsq.writer(':4150');

var r1count = 0; 
r1.on('message', function(msg){
    var body = msg.body.toString();
    process.stdout.write('\r r1count: ' + r1count++);
    msg.finish(); 
});


function next(){
    setTimeout(function(){
        writer.publish('events', 'foo');
        next(); 
    }, 100); 
}
next();
