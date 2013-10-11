(function () {
    function call(a) {
	var addp = function () { 
	    console.log("addp");
	    return 1; }	
	return a + addp();
    }
    var foo = 1;
    var bar = 'bar';
})().call(5);


function foo () {}
