var nsq = require('nsq.js')

var reader = nsq.reader({
    nsqlookupd: ['0.0.0.0:4161'], 
    maxInFlight: 1, 
    maxAttempts: 1, 
    topic: 'events', 
    channel: 'ingestion'
}); 

var sent =0; 
var recv =0; 

setInterval(function(){
    console.log(' sent/recv: %d/%d', sent, recv); 
}); 

reader.on('message', function(msg){
    ++recv; 
    msg.finish(); 
}); 

reader.on('error', function(err){
    console.log(err.stack); 
}); 

var writer = nsq.writer({
    nsqlookupd: ['0.0.0.0:4161']
}); 

writer.on('error', function(err){
    console.log(err.stack); 
}); 

setInterval(function(){
    ++sent; 
    writer.publish('events', 'some message here', function(err){
        if (err) console.log('writer error: %s', err.stack); 
    }); 
}, 1500); 
