/* 
 * visit.js
 * 
 * Framework for visiting each node of an AST and calling a variety of
 * possibly-mutating callbacks on the AST. 
 */


module.exports = {
    visit: visit,
    make_thunk: make_thunk,
    make_call: make_call,
    make_id: make_id
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
function visit(ast, visitors) {
    function apply_visitor(node, f) {
	return f(node);
    }
    var evisit = function(n){return visit(n, visitors);};

    // ignore nodes we've created
    if (ast.__megatron_ignore)
	return ast;
    
    // apply each visitor to the current AST
    ast = visitors.reduce(apply_visitor, ast);

    // figure out how to recurse
    switch (ast.type) {
    case "Program":
    case "BlockStatement":
	ast.body = ast.body.map(evisit);
	break;

    case "WithStatement":
	ast.object = evisit(ast.object);
	ast.body = evisit(ast.body);
	break;

    case "SwitchStatement":
	ast.cases = ast.cases.map(evisit);
	break;
	
    case "TryStatement":
	ast.block = evisit(ast.block);
	if (ast.finalizer !== null)
	    ast.finalizer = evisit(ast.finalizer);
	break;

    case "Function":
    case "WhileStatement":
    case "DoWhileStatement":
    case "ForStatement":
    case "ForOfStatement":
    case "LetStatement":
    case "FunctionDeclaration":
    case "FunctionExpression":
	ast.body = evisit(ast.body);
	break;

    case "ExpressionStatement":
	ast.expression = evisit(ast.expression);
	break;

    case "IfStatement":
	ast.test = evisit(ast.test);
	ast.consequent = evisit(ast.consequent);
	if (ast.alternate !== null)
	    ast.alternate = evisit(ast.alternate);
	break;

    case "LabeledStatement":
    case "EmtpyStatement":
    case "BreakSTatement":
    case "ContinueStatement":
    case "ReturnStatement":
    case "ThrowStatement":
    case "DebuggerStatement":
	break;
    }
    return ast;
    
}

/*
 * Constructor for an AST node.
 */ 
function __construct_node() {
    return {
	__megatron_ignore: true
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
    return ret;
}

/* 
 * Given a function f, return an Esprima object corresponding to a
 * call to f with the given _args_ (an array of esprima objects).
 */ 
function make_call(f, args) {
    var call = __construct_node();
    call.type = "ExpressionStatement";
    call.expression = {
	type: "CallExpression",
	callee: {
	    type: "Identifier",
	    name: f.name
	},
	arguments: args
    };
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
