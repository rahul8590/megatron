/* 
 * visit.js
 * 
 * Framework for visiting each node of an AST and calling a variety of
 * possibly-mutating callbacks on the AST. 
 */

var assert = require('assert');
var util = require('util');

module.exports = {
    visit: function(a, v) {return visit(a, v, 
					{function: "top-level"});},
    make_thunk: make_thunk,
    make_call: make_call,
    make_id: make_id,
    make_literal: make_literal,
    make_expst: make_expst
};

/*
 * ast - AST object returned by esprima.parse
 * visitors - list of functions of type ast_node -> ast_node
 * 
 * Recursively visit each node in the AST. For each node, fold over
 * visitors and apply the output of each previous visitor to the next
 * visitor. Replace the node in the AST with the output of the final
 * visitor.
 */
function visit(ast, visitors, context, show_debug) {
    if (show_debug === undefined)
	show_debug = false;
    if (ast === null) 
	return null;
    
    function debug(s) {
	if (show_debug)
	    console.error(s);
    }
    
    function apply_visitor(node, f) {
	return f(node, context);
    }
    var evisit = function(n, c) {return visit(n, visitors, c);};
    function curry_evisit(c) {
	return function (n) { return evisit(n, c); };
    }

    // ignore nodes we've created
    if (ast.megatron_ignore === true) {
	return ast;
    }
    
    debug("Visiting a statement of type " + ast.type);


    // figure out how to recurse
    switch (ast.type) {
    case "Program":
	ast.body = ast.body.map(curry_evisit({function: "top-level"}));
	break;
	
    case "BlockStatement":
	ast.body = ast.body.map(curry_evisit(context));
	break;

    case "WithStatement":
	ast.object = evisit(ast.object, context);
	ast.body = evisit(ast.body, context);
	break;

    case "SwitchStatement":
	ast.discriminant = evisit(ast.discriminant, context);
	ast.cases = ast.cases.map(curry_evisit(context));
	break;

    case "SwitchCase":
	ast.test = evisit(ast.test, context);
	ast.consequent = ast.consequent.map(curry_evisit(context));
	break;

    case "TryStatement":
	ast.block = evisit(ast.block, context);
	ast.finalizer = evisit(ast.finalizer);
	break;

    case "CatchClause":
	ast.guard = evisit(ast.guard, context);
	ast.body = evisit(ast.body, context);
	break;

    case "ComprehensionBlock":
	ast.right = evisit(ast.right, context);
	break;

    case "Function":
    case "ForStatement":
	ast.init = evisit(ast.init, context);
	ast.update = evisit(ast.update, context);
	// fall through
    case "WhileStatement":
    case "DoWhileStatement":
	ast.test = evisit(ast.test, context);
	ast.body = evisit(ast.body, context);
	break;

    case "ForOfStatement":
    case "ForInStatement":
	ast.left = evisit(ast.left, context);
	ast.right = evisit(ast.right, context);
	ast.body = evisit(ast.body, context);
	break;

    case "LetStatement":
    case "LetExpression":
	ast.head.init = evisit(ast.head.init, context);
	break;

    case "FunctionDeclaration":
	var new_context = {function: ast.id.name};
	ast.body = evisit(ast.body, new_context);
	ast.defaults = ast.defaults.map(curry_evisit(new_context));
	break;

    case "VariableDeclaration":
	ast.declarations = ast.declarations.map(curry_evisit(context));
	break;

    case "VariableDeclarator":
	ast.init = evisit(ast.init, context);
	break;
	
    case "ExpressionStatement":
	ast.expression = evisit(ast.expression, context);
	break;

    case "FunctionExpression":
	var new_context = {function: "anonym_func:" + ast.loc.start.line};
	ast.body = evisit(ast.body, new_context);
	ast.defaults = ast.defaults.map(curry_evisit(new_context));
	break;

    case "ArrayExpression":
	ast.elements = ast.elements.map(curry_evisit(context));
	break;

    case "ObjectExpression":
	ast.properties = ast.properties.map(function (p) {
	    p.value = evisit(p.value, context);
	    return p;
	});
	break;

    case "ArrowExpression":
	ast.defaults = ast.defaults.map(curry_evisit(context));
	ast.body = evisit(ast.body, context);
	break;

    case "SequenceExpression":
	ast.expressions = ast.expressions.map(curry_evisit(context));
	break;

    case "UnaryExpression":
    case "UpdateExpression":
	ast.argument = evisit(ast.argument, context);
	break;
	
    case "BinaryExpression":
    case "AssignmentExpression":
    case "LogicalExpression":
	ast.left = evisit(ast.left, context);
	ast.right = evisit(ast.right, context);
	break;

    case "ConditionalExpression":
    case "IfStatement":
	ast.test = evisit(ast.test, context);
	ast.consequent = evisit(ast.consequent, context);
	ast.alternate = evisit(ast.alternate, context);
	break;

    case "CallExpression":
	ast.arguments = ast.arguments.map(curry_evisit(context));
	ast.callee = evisit(ast.callee, context);
	break;

    case "MemberExpression":
	ast.object = evisit(ast.object, context);
	if (ast.computed)
	    ast.property = evisit(ast.property, context);
	break;

    case "ComprehensionExpression":
    case "GeneratorExpression":
	ast.body = evisit(ast.body, context);
	ast.blocks = ast.blocks.map(curry_evisit(context));
	ast.filter = evisit(ast.filter, context);
	break;
	
    case "LabeledStatement":
	ast.body = evisit(ast.body, context);
	break;

    case "ThrowStatement": // argument will never be null for a throw,
			   // but it doesn't really matter
    case "ReturnStatement":
	ast.argument = evisit(ast.argument, context);
	break;

    case "TryStatement":
	ast.block = evisit(ast.block, context);
	ast.finalizer = evisit(ast.finalizer, context);
	break;

    case "EmtpyStatement":
    case "BreakSTatement":
    case "ContinueStatement":
    case "DebuggerStatement":
    case "ThisExpression":
    case "Identifier":
    case "GraphExpression":
    default: 
	break;
    }
    // apply each visitor to the current AST
    ast = visitors.reduce(apply_visitor, ast);
    return ast;
}

/*
 * Constructor for an AST node.
 */ 
function __construct_node() {
    return {
	megatron_ignore: true
    };
}
/* 
 * Given an expression from Esprima, generate a thunk that yields the
 * result of that expression.
 */ 
function make_thunk(expr) {
    var ret = __construct_node();
    ret.type = "FunctionExpression";
    ret.id = null;
    ret.params = [];
    ret.defaults = [];
    ret.body = {
	type: "BlockStatement",
	body: [
	    {
		type: "ReturnStatement",
		argument: expr
	    }
	]
    };
    ret.rest = null;
    ret.generator = false;
    ret.expression = false;
    assert.equal(ret.megatron_ignore, true);
    return ret;
}

/* 
 * Given a function f, return an Esprima object corresponding to a
 * call to f with the given _args_ (an array of esprima objects).
 */ 
function make_call(fname, args) {
    var call = __construct_node();
    call.type = "CallExpression",
    call.callee = {
	type: "Identifier",
	name: fname
    };
    call.arguments = args;
    return call;
}

/*
 * Return an esprima identifier for the argument.
 */
function make_id(x) {
    var id = __construct_node();
    id.type = "Identifier";
    id.name = x.name;
    return id;
}

/* 
 * Return an esprima literal with the value v.
 */
function make_literal(v) {
    var lit = __construct_node();
    lit.type = "Literal";
    lit.value = v;
    return lit;
}

/* 
 * Wrap an expression in an expressionstatement.
 */ 
function make_expst(e) {
    var expst = __construct_node();
    expst.expression = e;
    expst.type = "ExpressionStatement";
    return expst;
}
