/* 
 * rewrite.js 
 * 
 * Given a javascript file, rewrite it to have instrumentation. This
 * includes instrumentation at the call site (for call graph
 * construction) and in the function body (for function timing).
 */
 
var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');
var visit = require('./visit.js');
var assert = require('assert');
var util = require('util');

function parse_file(filename) {
    return esprima.parse(fs.readFileSync(filename));
}

function find_functions(node, ctx) {
    if (node.type != "FunctionDeclaration") {
	return node;
    }
    console.log("got a function named " + node.id.name + 
	       " inside function " + ctx.function);
    return node;
}

function find_calls(node, ctx) {
    if (node.type != "CallExpression")
	return node;

    console.log("found function call to function " + node.callee.name + 
	       " in function " + ctx.function);
    return node;
}

/* 
 * A visitor that adds entry and exit instrumentation to functions.
 */ 
function instrument_function(node, ctx) {
    if (node.type != "FunctionDeclaration")
	return node;

    var body = node.body.body;
    body.unshift(visit.make_expst(visit.make_call('log_entry', node.id)));
    body.push(visit.make_expst(visit.make_call('log_exit', node.id)));
    node.body.body = body;
    return node;
}

function instrument_calls(node, ctx) {
    if (node.type != "CallExpression")
	return node;

    var args = [visit.make_literal(ctx.function),
		node.callee,
		visit.make_thunk(node)];
    return visit.make_call('log_call', args);
}

// since these go in-order, our call instrumentation has to precede
// function instrumentation, so we don't instrument our inserted
// calls. We could fix this by folding them into one visitor, I think.
var orig_ast = parse_file(process.argv[2]);
var new_ast = visit.visit(orig_ast, 
			  [instrument_calls,
			   instrument_function
			  ].reverse());
// console.log(util.inspect(new_ast, {depth: null, showHidden: true}));
console.log(escodegen.generate(new_ast));
