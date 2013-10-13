function get_really_high_res_time() {
    // browser-compatible
    return 0;
}

function log_call(caller, callee, thunk) {
    var call = {
	entry: 0, 
	exit: 0,
	from: caller,
	to: callee, // function took exit - entry time units
    }

    console.log(">>>call from " + caller + " to " + callee);
    console.log(">>>entering " + name);
    call.entry = get_really_high_res_time();
    var ret =  thunk();
    call.exit = get_really_high_res_time();
    console.log(">>>exiting "+ callee);
    
    // do something with call
    
    return ret;
}
