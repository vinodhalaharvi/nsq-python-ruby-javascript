var main = function(){
    for (var i = 0, len = 10; i < len; i++) {
        console.log(parseInt(Math.random(2).toString().slice(12)) % 100); 
    }
}; 

main(); 
