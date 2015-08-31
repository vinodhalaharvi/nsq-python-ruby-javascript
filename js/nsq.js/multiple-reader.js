/**
 * Module dependencies.
 */

var nsq = require('nsq.js');
// subscribe
var reader1; 
var reader2;

var reader1count = 0 ; 
var reader2count = 0; 

reader1 = nsq.reader({
    nsqd: ['0.0.0.0:4150'],
    maxInFlight: 1,
    topic: 'events',
    channel: 'ingestion1', 
});

reader2 = nsq.reader({
    nsqd: ['0.0.0.0:4150'],
    maxInFlight: 1, 
    topic: 'events',
    channel: 'ingestion2',
});

setTimeout(function(){
    reader1.on('message', function(msg){
        reader1count++; 
        process.stdout.write('\r ingestion1: ' + reader1count + ' ingestion2 ' + reader2count);
        msg.finish();
    });
}, 20);

setTimeout(function(){
    reader2.on('message', function(msg){
        //ignore the message
        reader2count++; 
        process.stdout.write('\r ingestion1: ' + reader1count + ' ingestion2 ' + reader2count);
        msg.finish();
    });
}, 80); 

var writer = nsq.writer({ port: 4150 });
function next() {
    setImmediate(function(){
        writer.publish('events', ['foo', 'bar', 'baz'], next);
    });
}
next();

setTimeout(function(){
    process.stdout.write('\n'); 
    process.exit(0);
}, 20000);
