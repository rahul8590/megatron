function log_entry(func) {
    console.log(">>>entered function " + func);
}

function log_exit(func) {
    console.log(">>>exited function " + func);
}

function log_call(caller, callee, thunk) {
    var name = "";
    if (callee.name == '') {
	console.log(callee);
	name = "undefined";
    } else {
	name = callee.name;
    }
    console.log(">>>call from " + caller + " to " + name);
    return thunk();
}
