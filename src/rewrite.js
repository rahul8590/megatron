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

//The debug function should accomodate console in other browser. (support for IE)
function debug(s) {
	if (typeof console == "undefined") {
    this.console = {log: function() {}};
	}
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
 * A visitor that builds a table of declared function names.
 */
function function_table() {
    var ret = {}
    ret.table = {};
    
    function store_functions(node, ctx) {
	if (node.type == "FunctionDeclaration") {
	    ret.table[node.id.name] = true;
	}
	return node;
    }
    ret.store_functions = store_functions;
    return ret;
}

/*
 * A visitor that rewrites functions to have only one return value,
 * and to return a hash of the interface:
 * { __megatron_ret: return value,
 *   __megatron_func_id: an identifier for the call graph}
 */ 
function rewrite_returns(node, ctx) {
    var return_obj_name   = "__megatron_ret";
    function mk_return_obj(fid, rexp) {
	var return_field_name = "__megatron_ret";
	var funcid_field_name = "__megatron_function_id";
	var this_field_name = "__megatron_this"
	return visit.make_objexp([
	    {key: funcid_field_name, val: visit.make_literal(fid)},
	    {key: this_field_name, val: visit.make_this()},
	    {key: return_field_name, val: rexp}
	]);
    }
    
    if (node.type != "FunctionDeclaration" && 
	node.type != "FunctionExpression") 
	return node;
    var funcid;
    
    if (node.type == 'FunctionDeclaration') 
	funcid = node.id.name;
    else
	funcid = (ctx.function + "__anonym:" + 
		  node.loc.start.line + ":" + node.loc.start.column)

    var return_obj_init = mk_return_obj(funcid, visit.make_literal(null));
    var return_decl = visit.make_decl(return_obj_name, 
				      return_obj_init, node.loc);
    var return_stmt = visit.make_ret(visit.make_id(return_obj_name));

    // rewrite all returns to assignments to
    // return_obj_name.return_field_name
    function replace_returns(node, ctx) {
	if (node.type != "ReturnStatement")
	    return node;
	
	var rhs;
	if (node.argument === null) {
	    rhs = visit.make_literal(null);
	} else {
	    rhs = node.argument;
	}
	assert.notEqual(rhs, null);
	var rewritten_return = visit.make_ret(mk_return_obj(funcid, rhs));
	return rewritten_return;
    }
    node.body = visit.visit(node.body, [replace_returns], {debug: true})
    node.body.body.push(return_stmt);
    node.body.body.unshift(return_decl);
    return visit.megatron_deignore(node);
}

/* 
 * A visitor that adds entry and exit instrumentation to functions.
 */ 
function instrument_calls(node, ctx) {
    if (node.type != "CallExpression" && node.type != "NewExpression")
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


	case "ThisExpression":
	    return "this";

	case "BinaryExpression":
	    return "<Binary Expression>";

	case "ArrayExpression":
	    return "<Array Literal>";

	case "Literal":
	    return "<Literal " + callee.value + ">";

	case "CallExpression":
	    return "<call:" + callee.loc.start.line + ":" + 
		callee.loc.start.col + ">";

	case "NewExpression":
	    return "<new " + get_callee_name(callee.callee) + ">";

	case "ConditionalExpression":
	    return "<dynamic conditional>";

	default:
	    debug("Can't handle callee object of type: " + callee.type);
	    debug(escodegen.generate(node));
	    debug("Exiting with errors");
	    process.exit(1);
	}
    }

    var args = [visit.make_literal(ctx.function),
		visit.make_literal(get_callee_name(node.callee)),
		visit.make_thunk(node),
		visit.make_this(node.loc),
		visit.make_literal(node.type == "NewExpression")
	       ];
    return visit.make_call('log_call', args, node.loc);
}

function sanity_check(ast, ctx) {
    assert.notEqual(ast.type, null);
    assert.notDeepEqual(ast.type, null);
    return ast;
}

function profile(program_string, show_debug) {
    if (show_debug === undefined)
	show_debug = false;

  
    var ast = esprima.parse(program_string, {loc: true});

    var ftab = function_table();
    visit.visit(ast, [ftab.store_functions]);

    var return_wrapped_ast = visit.visit(ast, 
    			     		[rewrite_returns]);

    var profiled_ast = visit.visit(ast, [instrument_calls], false);

    var final_ast = visit.visit(profiled_ast, [sanity_check], false);

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
