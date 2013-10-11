//Visiting a statement of type Program
//Visiting a statement of type ExpressionStatement
//Visiting a statement of type CallExpression
//Visiting a statement of type MemberExpression
//Visiting a statement of type FunctionExpression
//Visiting a statement of type BlockStatement
//Visiting a statement of type FunctionDeclaration
//Visiting a statement of type BlockStatement
//Visiting a statement of type VariableDeclaration
//Visiting a statement of type VariableDeclarator
//Visiting a statement of type FunctionExpression
//Visiting a statement of type BlockStatement
//Visiting a statement of type ReturnStatement
//Visiting a statement of type Literal
//Visiting a statement of type ReturnStatement
//Visiting a statement of type BinaryExpression
//Visiting a statement of type Identifier
//Visiting a statement of type Identifier
//Visiting a statement of type VariableDeclaration
//Visiting a statement of type VariableDeclarator
//Visiting a statement of type Literal
//Visiting a statement of type VariableDeclaration
//Visiting a statement of type VariableDeclarator
//Visiting a statement of type Literal
//Visiting a statement of type Identifier
function log_entry(func) {
    console.log(">>>entered function " + func);
}

function log_exit(func) {
    console.log(">>>exited function " + func);
}

function log_call(caller, callee, thunk) {
    var name = "";
    if (callee.name == '') {
	console.log(callee);
	name = "undefined";
    } else {
	name = callee.name;
    }
    console.log(">>>call from " + caller + " to " + name);
    return thunk();
}
// instrumented code follows 
log_call('top-level', function () {
    log_entry('top-level__funcexp__1');
    function call(a) {
        log_entry(call);
        var addp = function () {
            log_entry('call__funcexp__3');
            return 1;
            log_exit('call__funcexp__3');
        };
        return a + addp;
        log_exit(call);
    }
    var foo = 1;
    var bar = 'bar';
    log_exit('top-level__funcexp__1');
}.call, function () {
    return function () {
        log_entry('top-level__funcexp__1');
        function call(a) {
            log_entry(call);
            var addp = function () {
                log_entry('call__funcexp__3');
                return 1;
                log_exit('call__funcexp__3');
            };
            return a + addp;
            log_exit(call);
        }
        var foo = 1;
        var bar = 'bar';
        log_exit('top-level__funcexp__1');
    }.call(5);
});
