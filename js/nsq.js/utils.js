var test = function(){
    console.log("that " + "this is a string with %d", 5); 
    return ; 
    var readers = []; 
    for (var i = 0, len = 2; i < len; i++) {
        readers[i] = Math.random(16).toString().slice(2); 
    }

    readers.forEach(function(reader){
        console.log(reader); 
    }); 

    console.log("\n"); 
}; 
test(); 

