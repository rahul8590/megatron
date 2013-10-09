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

