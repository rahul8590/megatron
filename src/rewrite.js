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
    return node
}

visit.visit(parse_file(process.argv[2]), 
	     [find_functions])
