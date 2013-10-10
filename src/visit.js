/* 
 * visit.js
 * 
 * Framework for visiting each node of an AST and calling a variety of
 * possibly-mutating callbacks on the AST. 
 */

var assert = require('assert');

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
function visit(ast, visitors, context) {
    if (ast === null) 
	return null;
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
    
    // apply each visitor to the current AST
    ast = visitors.reduce(apply_visitor, ast);

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
	
    case "TryStatement":
	ast.block = evisit(ast.block, context);
	ast.finalizer = evisit(ast.finalizer);
	break;

    case "Function":
    case "ForStatement":
	ast.init = evisit(ast.init, context);
	ast.update = evisit(ast.init, context);
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
	ast.head.init = evisit(ast.head.init, context);


    case "FunctionExpression":
	// console.log("recursing into function expression");
	ast.body = evisit(ast.body, context);
	break;

    case "FunctionDeclaration":
	// console.log("recursing into function decl");
	ast.body = evisit(ast.body, {function: ast.id.name});
	break;

	
    case "ExpressionStatement":
	// console.log("recursing into expression statement");
	ast.expression = evisit(ast.expression, context);
	break;

    case "IfStatement":
	// console.log("Recursing into if statement");
	ast.test = evisit(ast.test, context);
	ast.consequent = evisit(ast.consequent, context);
	ast.alternate = evisit(ast.alternate, context);
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

    case "EmtpyStatement":
    case "BreakSTatement":
    case "ContinueStatement":
    case "DebuggerStatement":
    default: 
	// console.log("Hit default");
    }
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
