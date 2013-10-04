/* 
 * rewrite.js 
 * 
 * Given a javascript file, rewrite it to have instrumentation. This
 * includes instrumentation at the call site (for call graph
 * construction) and in the function body (for function timing).
 */
 
var esprima = require('esprima');
var fs = require('fs');

/*
 * ast - AST object returned by esprima.parse
 * visitors - list of functions of type ast_node -> ast_node
 * 
 * Recursively visit each node in the AST. For each node, fold over
 * visitors and apply the output of each previous visitor to the next
 * visitor. Replace the node in the AST with the output of the final
 * visitor.
 */
function esprima_visit(ast, visitors) {
    function apply_visitor(node, f) {
	return f(node);
    }
    var evisit = function(n){return esprima_visit(n, visitors);};

    // apply each visitor to the current AST
    ast = visitors.reduce(apply_visitor, ast)

    // figure out how to recurse
    switch (ast.type) {
    case "Program":
    case "BlockStatement":
	ast.body = ast.body.map(evisit)
	break;

    case "WithStatement":
	ast.object = evisit(ast.object);
	ast.body = evisit(ast.body);
	break;

    case "SwitchStatement":
	ast.cases = ast.cases.map(evisit)
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

    case "LabeledStatement":
    case "IfStatement":
    case "ExpressionStatement":
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

function parse_file(filename) {
    return esprima.parse(fs.readFileSync(filename));
}

function find_functions(node) {
    if (node.type == "FunctionDeclaration") {
	console.log("got a function named " + node.id.name);
    }
    return node
}

esprima_visit(parse_file(process.argv[2]), 
	     [find_functions])
