function get_really_high_res_time() {
    // browser-compatible
    return 0;
}

function log_call(caller, callee, thunk) {
    var name = "";
    if (callee.name == '') {
	console.log(callee);
	name = "undefined";
    } else {
	name = callee.name;
    }
    var call = {
	entry: 0, 
	exit: 0,
	from: caller,
	to: name, // function took exit - entry time units
    }

    console.log(">>>call from " + caller + " to " + name);
    console.log(">>>entering " + name);
    call.entry = get_really_high_res_time();
    var ret =  thunk();
    console.log(">>>exiting "+ name);
    call.exit = get_really_high_res_time();
    
    return ret;
}
