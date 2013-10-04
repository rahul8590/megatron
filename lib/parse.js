/*
The tokenize_code function will parse the source code and do the following
1. purge all the comments from it
2. Identify variables / constants etc 
3. Create a AST from the code with their properties
*/
function tokenize_code() {

}



/* The function parse will input the actual code with various flag options


Currently the following are the 2 flags considered.
cg => Call graph
et => execution time of the functions in the code

*/
function parse (code , flag) {
	var linenumber,
		index,
		program;

	if (typeof code !== 'String' && !(code instance of String)){
		code = String(code);
	}

	index = 0;
	linenumber = (code.length > 0 ) ? 1 : 0 ;

	try {
		program = tokenize_code();
	}
	catch (e)
	{
		throw e;
	}
}