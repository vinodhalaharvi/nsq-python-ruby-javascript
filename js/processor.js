var nsq = require('nsqjs');
var totalPublished = 0 ; 
var countThreshold = 15; 
var playIDMax = 5; 
var sampleData = 1000;
var clientMessageCount = 0; 

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
var writer = new nsq.Writer('127.0.0.1', 4150);
writer.connect();
writer.on('ready', function () {
    for (var i = 0; i < sampleData; i++) {
        var playid = parseInt(Math.random(2).toString().slice(12)) % playIDMax; 
        var msg = {video_id: playid, video_name: "awesome video " + playid}; 
        writer.publish('topic', msg); 
        totalPublished++; 
        process.stdout.write("\r Total data published = " +  totalPublished); 
    } 
    //console.log("Total data publised = %d", totalPublished); 
});
writer.on('closed', function(){
    console.log("writer close .. "); 
}); 


//##########################################
var readerInbound = new nsq.Reader('topic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 20,
    maxAttempts: 0
});
readerInbound.connect(); 
readerInbound.on('message', function (msg) {
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    var body = msg.body; 
    //console.log(' reader Inbound : ' + body.toString()); 
    update(obj); 
    if (count[obj.video_id].count < countThreshold) { 
        writer.publish('outBoundTopic', {video_id: obj.video_id, count: count[obj.video_id]}); 
        msg.finish();
        /*console.log('writing outBound: ' 
                    + JSON.stringify({video_id: obj.video_id, 
                                     count: count[obj.video_id]})); */
        count[obj.video_id].changed = false; 
    } else { 
        msg.finish();
    } 
    //writer.publish('outBoundTopic', body.toString()); 
});
setTimeout(function(){
    for (var i = 0, len = playIDMax; i < len; i++) {
        if (count[i] && count[i].hasOwnProperty("count")) {
            if (count[i].count >= countThreshold) { 
                writer.publish('outBoundTopic', {video_id: i, count: count[i]}); 
                //console.log('writing outBound: ' + JSON.stringify({video_id: i, count: count[i]})); 
                count[i].changed = false; 
            }
        }
    }
}, 5000 - 100); 
readerInbound.on('close', function () {
    console.log("readerInbound closed .. "); 
});

//##########################################
var clientReaderCount = 0;
var clientReader = new nsq.Reader('outBoundTopic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 20,
    maxAttempts: 0
});
clientReader.connect(); 
clientReader.on('message', function (msg) {
    //console.log("reading outBoundTopic : " + msg.body.toString()); 
    clientReaderCount++; 
    msg.finish();
});


//finally print how many messages have been delivered to the
// client
setTimeout(function(){
    for (var i = 0, len = playIDMax; i < len; i++) {
        if (count[i] && count[i].hasOwnProperty("count")) {
            clientMessageCount += count[i].count; 
        }
    }
    //console.log("clientReaderCount is: %d", clientMessageCount); 
    process.stdout.write("\r                                                             "); 
    process.stdout.write("\r clientReaderCount is : " +  clientMessageCount); 
}, 9000); 
