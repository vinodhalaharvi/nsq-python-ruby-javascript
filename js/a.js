var update = function(obj){ 
    obj.count++; 
    obj.count++; 
}; 

var main = function(){ 
    var obj = {}; 
    obj.count = 0; 
    update(obj); 
    obj.count++; 
    console.log("count is %d", obj.count); 
}; 


main(); 
