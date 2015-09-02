var nsq = require('nsqjs')
var sampleData = 1; 

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

