var nsq = require('nsqjs');
var totalPublished = 0 ; 
var countThreshold = 5; 
var playIDMax = 2; 
var sampleData = 100;
var clientMessageCount = 0; 

//##########################################
//utility functions
count = {}; 
var update = function(obj){
    if (!count[obj.video_id]){ 
        var value = {}; 
        value.count = 1; 
        value.video_id = obj.video_id; 
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
//write sample data to the inbound queue
var writer = new nsq.Writer('127.0.0.1', 4150);
writer.connect();
writer.on('ready', function () {
    for (var i = 0; i < sampleData; i++) {
        var playid = parseInt(Math.random(2).toString().slice(12)) % playIDMax; 
        var msg = {video_id: playid, video_name: "awesome video " + playid}; 
        writer.publish('topic', msg); 
        totalPublished++; 
        process.stdout.write("\r wtopic = " +  totalPublished + " rtopic = " + readInboundCount); 
    } 
    //console.log("Total data publised = %d", totalPublished); 
});
writer.on('closed', function(){
    //console.log("writer close .. "); 
}); 



//##########################################
//Read from inbound queue and process
//and write to outbound queue
//
var readInboundCount = 0; 
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
    readInboundCount++; 
    process.stdout.write("\r wtopic = " +  totalPublished + " rtopic = " + readInboundCount); 
    update(obj); 
    if (count[obj.video_id].count < countThreshold) { 
        writer.publish('outBoundTopic', {video_id: obj.video_id, count: count[obj.video_id].count}); 
        count[obj.video_id].changed = false; 
        msg.finish();
        /*console.log('writing outBound: ' 
                    + JSON.stringify({video_id: obj.video_id, 
                                     count: count[obj.video_id]})); */
    } else { 
        msg.finish();
    } 
    //writer.publish('outBoundTopic', body.toString()); 
});
setTimeout(function(){
    for (var i = 0, len = playIDMax; i < len; i++) {
        if (count[i].changed === true && count[i] && count[i].hasOwnProperty("count")) {
            if (count[i].count >= countThreshold) { 
                count[i].changed = false; 
                writer.publish('outBoundTopic', {video_id: i, count: count[i].count}); 
                //console.log('writing outBound: ' + JSON.stringify({video_id: i, count: count[i]})); 
            }
        }
    }
}, 6000);  // in 6 seconds 
readerInbound.on('close', function () {
    //console.log("readerInbound closed .. "); 
});


//##########################################
//Read from outbound queue and publish data to client
var clientReaderCount = 0;
var clientReader = new nsq.Reader('outBoundTopic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 20,
    maxAttempts: 0
});
clientReader.connect(); 
var clientCallback = function(messages){
    for (var i = 0, len = messages.length; i < len; i++) {
        process.stdout.write("\r clientMessageCount is : " + JSON.stringify(messages[i])); 
    }
}; 
var aggregateCount = {}; 
var clientMessages = []; 
var clientMessageCount = 0; 
var changed = []; 
clientReader.on('message', function (msg) {
    //console.log("reading outBoundTopic : " + msg.body.toString()); 
    msg.finish();
    clientMessages.push(msg.body.toString()); 
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    console.log(jsonString); 
    return; 
    if (aggregateCount[obj.video_id]) { 
        aggregateCount[obj.video_id] += obj.count; 
    } else { 
        clientMessageCount++; 
        aggregateCount[obj.video_id] = 1; 
        changed.push(obj.video_id); 
    }
    if (clientMessageCount >= 2){ 
        for (var i = 0, len = changed.length; i < len; i++) {
            clientMessages.push({video_id: changed[i], count: aggregateCount[changed[i]].count})
        }
        clientMessageCount = 0; 
        process.stdout.write("\n"); 
        clientCallback(clientMessages); 
        clientMessages = []; 
    }
    clientReaderCount++; 
});



//##########################################
// Sanity check, print count total of messages recieved
// which should be equal to the total # messages sent
setTimeout(function(){
    for (var i = 0, len = playIDMax; i < len; i++) {
        if (count[i] && count[i].hasOwnProperty("count")) {
            clientMessageCount += count[i].count; 
        }
    }
    //console.log("clientReaderCount is: %d", clientMessageCount); 
    //process.stdout.write("\n\n\r clientReaderCount is : " +  clientMessageCount); 
}, 9000); 
