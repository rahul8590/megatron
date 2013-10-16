function foo(n) {
    return function () {
	return n * 2;
    }
}

var baz = foo(100);
//log_call("top-level", "baz:line:col", function () { return foo(100);})
var bar = foo(10);
//log_call("top-level", "bar:line:col", function () { return foo(100);})

console.log(baz() + bar());

// foo.anonymous_function:1 called twice, 50% via bar 50% via baz


