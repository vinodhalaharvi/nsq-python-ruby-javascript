var slowcount = 0; 
var fastcount = 0;
var printfast = function(item){
    fastcount++; 
    process.stdout.write('\r printfast: ' + fastcount + ' printslow: ' + slowcount); 
    setTimeout(printfast, 100, item); 
}; 


var printslow = function(item){
    slowcount++; 
    process.stdout.write('\r printfast: ' + fastcount + ' printslow: ' + slowcount); 
    setTimeout(printslow, 1000, item); 
}; 


var test = function(){ 
    var array = [1,1,1,4,4,4, 4,4,4,4,4,4,4,4,4,4]; 
    array.forEach(function(item){
        if (item === 1)
            printfast(item); 
        else 
            printslow(item);
    }); 
}; 


test(); 
