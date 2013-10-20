/* 
 * visit.js
 * 
 * Framework for visiting each node of an AST and calling a variety of
 * possibly-mutating callbacks on the AST. 
 */

var assert  = require('assert');
var util    = require('util');
var esprima = require('esprima');

module.exports = {
    visit: function(a, v, d) {return visit(a, v, 
					{context: {function: "top-level"},
					debug: d});},
    make_thunk: make_thunk,
    make_call: make_call,
    make_id: make_id,
    make_literal: make_literal,
    make_expst: make_expst,
    make_decl: make_declaration,
    make_member: make_member_expr,
    make_assign: make_assignment,
    make_ret: make_return,
    make_objexp: make_objexp,
    make_block: make_block
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
function visit(ast, visitors, optargs) {
    function debug(s) {
	if (optargs.debug)
	    console.error(s);
    }
    function apply_visitor(node, f) {
	return f(node, context);
    }
    function evisit(n, c) {
	return visit(n, visitors, 
		     {context: c,
		      debug: optargs.debug});
    };
    function curry_evisit(c) {
	return function (n) { return evisit(n, c); };
    };
    var context = optargs.context;

    if (ast === null)  {
	debug("Got a null ast, exiting");
	return ast;
    }

    debug("Visiting a statement of type " + ast.type);

    // ignore nodes we've created
    if (ast.megatron_ignore === true) {
	debug("Megatron-created node, bailing");
	return ast;
    }
    


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

    case "NewExpression":
	ast.callee = evisit(ast.callee, context);
	ast.arguments = ast.arguments.map(curry_evisit(context));
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
    case "BreakStatement":
    case "ContinueStatement":
    case "DebuggerStatement":
    case "ThisExpression":
    case "Identifier":
    case "GraphExpression":
    case "Literal":
	break

    default: 
	console.error("Unhandled case of type " + ast.type);
	process.exit(1);
	break;
    }
    // apply each visitor to the current AST
    ast = visitors.reduce(apply_visitor, ast);
    return ast;
}

function sanitize_graph(ast) {
    if (ast.type === null) {
	console.error("Null typed node!");
	console.error(util.inspect(ast, {depth: null}));
	process.exit(255);
    }
    
    for (field in ast) {
	try {
	    if ("type" in ast.field) {
		sanitize_graph(ast.field);
	    }
	} catch (TypeError) {}
    }
}

/*
 * Constructor for an AST node.
 */ 
function __construct_node(type, loc) {
    return {
	type: type, 
	loc: loc,
	megatron_ignore: true
    };
}
/* 
 * Given an expression from Esprima, generate a thunk that yields the
 * result of that expression.
 */ 
function make_thunk(expr, loc) {
    var ret = __construct_node("FunctionExpression", loc);
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
function make_call(fname, args, loc) {
    var call = __construct_node("CallExpression", loc);
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
function make_id(x, loc) {
    var id = __construct_node("Identifier", loc);
    id.name = x;
    return id;
}

/* 
 * Return an esprima literal with the value v.
 */
function make_literal(v, loc) {
    var lit = __construct_node("Literal", loc);
    lit.value = v;
    return lit;
}

/* 
 * Wrap an expression in an expressionstatement.
 */ 
function make_expst(e, loc) {
    if (!loc) 
	loc = e.loc;
    var expst = __construct_node("ExpressionStatement", loc);
    expst.expression = e;
    return expst;
}

function make_declaration(name, init, loc) {
    var decl = __construct_node("VariableDeclaration", loc);
    var declor = __construct_node("VariableDeclarator", loc);
    decl.kind = "var";
    declor.id = make_id(name);
    declor.init = init;
    decl.declarations = [declor];
    return decl;
}

function make_member_expr(object_name, member_name, loc) {
    var mexp = __construct_node("MemberExpression", loc);
    mexp.object = make_id(object_name);
    mexp.property = make_id(member_name);
    return mexp;
}

function make_assignment(lhs, rhs, loc) {
    var asexp = __construct_node("AssignmentExpression", loc);
    asexp.operator = "=";
    asexp.left = lhs;
    asexp.right = rhs;
    return asexp;
}

function make_return(arg, loc) {
    var ret = __construct_node("ReturnStatement", loc);
    ret.argument = arg;
    return ret;
}

function make_property(k, v, loc) {
    var prop = __construct_node("Property", loc);
    prop.key = k;
    prop.value = v;
    return prop;
}

function make_objexp(props, loc) {
    var ret = __construct_node("ObjectExpression", loc);
    ret.properties = [];
    for (var i = 0; i < props.length; i++) {
	ret.properties.push(make_property(make_id(props[i].key, loc), 
					  props[i].val));
    }
    return ret;    
}

function make_block(stmts, loc) {
    var bl = __construct_node("BlockStatement", loc);
    bl.body = stmts;
    return bl;
}
