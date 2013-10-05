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
 * Given a function f, return an Esprima object corresponding to a
 * call to f with the given _args_ (an array of esprima objects).
 */ 
function make_call(f, args) {
    return {
	type: "ExpressionStatement",
	expression: {
	    type: "CallExpression",
	    callee: {
		type: "Identifier",
		name: f.name
	    },
	    arguments: args
	}
    };
}

function instrument_function(node) {
    if (node.type != "FunctionDeclaration")
	return node;

    function log_entry(func) {
    	console.log("entered function " + func.name);
    }
    function log_exit(func) {
    	console.log("exited function " + func.name);
    }

    node.body.shift(make_call(log_entry, node.id));
    node.body.push(make_call(log_exit, node.id));
    return node;
}

visit.visit(parse_file(process.argv[2]), 
	     [find_functions, find_calls])
