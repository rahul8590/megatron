/* 
 * rewrite.js 
 * 
 * Given a javascript file, rewrite it to have instrumentation. This
 * includes instrumentation at the call site (for call graph
 * construction) and in the function body (for function timing).
 */
 
var esprima = require('esprima');
var fs = require('fs');
var visit = require('./visit.js');

function parse_file(filename) {
    return esprima.parse(fs.readFileSync(filename));
}

function find_functions(node) {
    if (node.type == "FunctionDeclaration") {
	console.log("got a function named " + node.id.name);
    }
    return node;
}

function find_calls(node) {
    if (node.type != "CallExpression")
	return node;

    console.log("found function call to function " + node.callee.name);
    return node;
}

/* 
 * A visitor that adds entry and exit instrumentation to functions.
 */ 
function instrument_function(node) {
    if (node.type != "FunctionDeclaration")
	return node;

    function log_entry(func) {
    	console.log("entered function " + func.name);
    }
    function log_exit(func) {
    	console.log("exited function " + func.name);
    }
    
    body.shift(visit.make_call(log_entry, node.id));
    body.push(visit.make_call(log_exit, node.id));
    node.body.body = body;
    return node;
}

function instrument_calls(node) {
    if (node.type != "CallExpression")
	return node;

    function log_call(callee, thunk) {
	// we need to get the caller somehow. We don't have access to
	// that in the visitor pattern. I think we can do it via
	// passing in an object that has information to the visitors,
	// but that seems like a hack.
	var caller = "magic";
	console.log("call from " + caller + " to " + callee.name);
	return thunk();
    }
    
    var args = [node.callee,
		visit.make_thunk(node)];
    return visit.make_call(log_call, args);
}


visit.visit(parse_file(process.argv[2]), 
	    // since these go in-order, our call instrumentation has
	    // to precede function instrumentation, so we don't
	    // instrument our inserted calls. We could fix this by
	    // folding them into one visitor, I think.
	     [instrument_calls,
	      instrument_function, 
	      find_functions, 
	      find_calls])
