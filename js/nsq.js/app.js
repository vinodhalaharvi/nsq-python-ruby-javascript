var nsq = require('nsq.js')

var reader = nsq.reader({
    nsqd: [':4150'], 
    maxAttempts: 5, 
    maxInFlight: 1, 
    topic: 'events', 
    channel: 'ingestion'
}); 

reader.on('error', function(err){
    console.log(err.stack); 
}); 

reader.on('message', function(msg){
    var body = msg.body.toString(); 
    console.log("%s has %d attempts ", body, msg.attempts); 
    msg.requeue(200); 
}); 

reader.on('discard', function(msg){
    console.log("giving up on %s", msg.body.toString()); 
    msg.finish();
}); 


var writer = nsq.writer(':4150'); 

writer.on('ready', function(){
    writer.publish('events', 'foo'); 
    writer.publish('events','bar'); 
    writer.publish('events','bazz'); 
}); 

