var nsq = require('nsqjs');
var reader = new nsq.Reader('topic', 'channel', {
    lookupdHTTPAddresses:  '127.0.0.1:4161', 
    maxInFlight: 1,
    maxAttempts: 0
});

reader.connect(); 
count = {}; 
var update = function(msg){
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    if (!count[obj.video_id])
        count[obj.video_id] = 1; 
    else 
        count[obj.video_id]++; 
    console.log("updating video_id " + obj.video_id + " totalcount: " + count[obj.video_id]); 
}; 

var printCount = function(){
    process.stdout.write('\r video_id: ' + count[0] ); 
}; 

//all available reader events below
//message discard error nsqd_connected nsqd_closed
reader.on('message', function (msg) {
    var jsonString = msg.body.toString(); 
    var obj = JSON.parse(jsonString); 
    update(msg); 
    //printCount(); 
    msg.finish();
});

//all available reader events below
//message discard error nsqd_connected nsqd_closed
reader.on('close', function () {
    console.log(count.toString()); 
    console.log("reader close .. "); 
});
