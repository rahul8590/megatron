(function () {
    function call(a) {
	var addp = function () { return 1; }
	return a + addp;
    }
    var foo = 1;
    var bar = 'bar';
}).call(5);

