var actualDataCount = 100000; 
var testingSampleFactor = 100; 
var dataCount = actualDataCount / testingSampleFactor; 
var thresholdFilterCount = 10;  //should actually be 100 
var totalPublished = 0;

var nsq = require('nsqjs');

//utility functions
count = {}; 
var update = function(obj){
    if (!count[obj.video_id]){ 
        var value = {}; 
        value.count = 1; 
        value.id = obj.video_id; 
        value.changed = true; 
        count[obj.video_id] = value; 
    } else  { 
        value = count[obj.video_id]; 
        value.count++; 
        value.changed = true; 
        count[obj.video_id] = value; 
    }
}; 


//##########################################
//write sample data of 100 rows
var writer = new nsq.Writer('127.0.0.1', 4150);
writer.connect();
//writer events
//ready closed error
writer.on('ready', function () {
    for (var i = 0, len = dataCount; i < len; i++) {
        var playid = parseInt(Math.random(2).toString().slice(12)) % 100; 
        // playids from 15 - 100 
        playid = (playid < 15)? 15 : playid;
        var msg = {video_id: playid, video_name: "awesome video " + playid}; 
        writer.publish('topic', msg); 
        totalPublished++; 
    } 

    for (var playid = 0, len = 15; playid < len; playid++) {
        //0 - 14 playids will have less than 100 video plays
        var count = parseInt(Math.random(2).toString().slice(12)) % thresholdFilterCount; 
        for (var i = 0;  i < count; i++) {
            var msg = {video_id: playid, video_name: "awesome video " + playid}; 
            writer.publish('topic', msg); 
            totalPublished++; 
        }
    }

    console.log("Total data publised = %d", totalPublished); 
});
writer.on('closed', function(){
    console.log("writer close .. "); 
}); 



//##########################################
var readerInbound = new nsq.Reader('topic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 40,
    maxAttempts: 0
});
readerInbound.connect(); 
//all available readerInbound events below
//message discard error nsqd_connected nsqd_closed
readerInbound.on('message', function (msg) {
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    update(obj); 
    //console.log("Publishing : " + jsonString); 
    //writer.publish('outBoundTopic', jsonString); 
    if (count[obj.video_id].count < thresholdFilterCount) { 
        writer.publish('outBoundTopic', {video_id: obj.video_id, count: count[obj.video_id]}); 
        count[obj.video_id].changed = false; 
        msg.finish();
    } 
});
//all available readerInbound events below
//message discard error nsqd_connected nsqd_closed
readerInbound.on('close', function () {
    console.log("readerInbound closed .. "); 
});

//publish the rest
setTimeout(function(){
    for (var i = 0, len = 100; i < len; i++) {
        if (count[i].count >= thresholdFilterCount) { 
            writer.publish('outBoundTopic', {video_id: i, count: count[i]}); 
            count[i].changed = false; 
        }
    }
}, 7000 - 100); 


//##########################################
var clientReader = new nsq.Reader('outBoundTopic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 20,
    maxAttempts: 0
});
clientReader.connect(); 
//all available clientReader events below
//message discard error nsqd_connected nsqd_closed
clientReader.on('message', function (msg) {
    //console.log("clientReader: " + msg.body.toString()); 
    console.log("clientReader : " + msg.body.toString()); 
    msg.finish();
});
