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

function debug(s) {
    console.error(s);
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
function instrument_calls(node, ctx) {
    if (node.type != "CallExpression")
	return node;

    function get_callee_name(callee) {
	switch (callee.type) {
	case "Identifier":
	    return callee.name;
	    
	case "FunctionExpression":
	    return ("__anonymous_function_" + ctx.function + 
		    "#" + callee.loc.start.line);

	case "MemberExpression":
	    return (get_callee_name(callee.object) + "." + 
		    get_callee_name(callee.property));


	case "CallExpression":
	    debug(util.inspect(callee.loc, {depth: null}));
	    return "call:" + callee.loc.start.line + ":" + callee.loc.start.col;

	default:
	    debug("Can't handle callee object of type: " + callee.type);
	    debug(escodegen.generate(node));
	    debug("Exiting with errors");
	    process.exit(1);
	}
    }

    var args = [visit.make_literal(ctx.function),
		visit.make_literal(get_callee_name(node.callee)),
		visit.make_thunk(node)];
    return visit.make_call('log_call', args, node.loc);
}

function profile(program_string, debug) {
    if (debug === undefined)
	debug = false;

    var handlers = [instrument_calls];

    var ast = esprima.parse(program_string, {loc: true});
    var profiled_ast = visit.visit(ast, handlers, debug);
    return (fs.readFileSync('./src/runtime.js') + 
	    "// instrumented code follows \n" + 
	    escodegen.generate(profiled_ast));
}

if(require.main === module) { 
    console.log(profile(fs.readFileSync(process.argv[2]), 
		       false)); 
}

module.exports = {
    profile: profile
};
