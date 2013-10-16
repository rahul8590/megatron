function bar() { 
    console.log("bar");
    return 10;
}

function foo() { 
    console.log("foo");
    return bar;
}
var baz = foo();
baz();
var foobar = foo();
foobar();


