/* The tracer object will have a subscriber which will handle all 
exceptions thrown by the functions in the browser. In this case to
fetch the call Stack trace. 

*/

var tracer = {} ;

// Encapusulating the report object into closure.

tracer.report =  ( function () {
	var handles = [];
	var lastException = null,
		lastExceptionStack = null;

	var subscriber = function (handle) {
		handles.push(handle);
	};

	var notify = function (stack) {
		var exception = null ;
		for (var i in handles)
			try {
				handles[i](stack);
			}
			catch (e) {
				exception = e;
			}
		if (exception) { throw exception; }
	};


}) ();





var compute_stack = ( function () {
	var debug = false;
	var sourcecache = {};


	var load_source = function (url){
		try {
			var request = new XMLHttpRequest();
			request.open("GET",url,false);
			request.send("");
			return request.responseText;
		}
		catch (e) {
			console.log("there has been and exception");
			return "";
		}




		
	}
}








/*
Just a prototype to check the tracer. 

=================
function trace (e,fn) {
	e.stackTrace = e.stackTrace || [] ; e.stackTrace.push(fn); return e;
}

function d() {
		console.log ("this is function");
}	

function c() { try {throw new Error ("Mooo..!!!");} catch (e) {throw trace(e, "c"); } }
function b() { try { c(); } catch (e) { throw trace(e, "b"); } }
function a() { try { b(); } catch (e) { throw trace(e, "a"); } }

try
{
  a();
  e = new Error();
  
}
catch (e)
{
  console.log("Error: " + e.message + "\r\n" + "Stack Trace: " + e.stackTrace.join(" \n"));
}
======= End of Example =============
*/
