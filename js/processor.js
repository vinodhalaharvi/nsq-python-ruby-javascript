var nsq = require('nsqjs');

//utility functions
count = {}; 
var update = function(msg){
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    if (!count[obj.video_id])
        count[obj.video_id] = 1; 
    else 
        count[obj.video_id]++; 
}; 


//##########################################
//write sample data of 100 rows
var writer = new nsq.Writer('127.0.0.1', 4150);
writer.connect();
//writer events
//ready closed error
writer.on('ready', function () {
    for (var i = 0, len = 100; i < len; i++) {
        var msg = {video_id: i, video_name: "awesome video " + i}; 
        writer.publish('topic', msg)
    } 
});
writer.on('closed', function(){
    console.log("writer close .. "); 
}); 



//##########################################
var readerInbound = new nsq.Reader('topic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 1,
    maxAttempts: 0
});
readerInbound.connect(); 
//all available readerInbound events below
//message discard error nsqd_connected nsqd_closed
readerInbound.on('message', function (msg) {
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    //update(msg); 
    writer.publish('outBoundTopic', msg); 
    msg.finish();
});
//all available readerInbound events below
//message discard error nsqd_connected nsqd_closed
readerInbound.on('close', function () {
    console.log("readerInbound closed .. "); 
});




//##########################################
var clientReader = new nsq.Reader('outBoundTopic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161'
});
clientReader.connect(); 
//all available clientReader events below
//message discard error nsqd_connected nsqd_closed
clientReader.on('message', function (msg) {
    console.log("clientReader: " + msg.body.toString()); 
    msg.finish();
});


