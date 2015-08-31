var nsq = require('nsqjs');
var writer = new nsq.Writer('127.0.0.1', 4150);
var callback = function(error){
    if (error) console.log(error.message); 
}; 

writer.connect();
//writer events
//ready closed error
writer.on('ready', function () {
    for (var j = 0, len1 = 15; j < len1; j++) { 
        for (var i = 0, len = 50; i < len; i++) {
            message = {video_id: j, video_name: "awesome video " + j}; 
            writer.publish("topic", message, callback); 
            console.log(message); 
        }
    }
});

//writer events
//ready closed error
writer.on('close', function () {
    console.log('writer closed');  
});

