function detect_browser() {
    var browserName;

    if (typeof window == 'undefined') {
	if (typeof version != 'undefined' && version() == "3.22.15")
	    return 'd8';
	return 'node';
    }
    var nAgt = navigator.userAgent;
    browserName  = navigator.appName;
    var nameOffset,verOffset,ix;
    
    // In Opera, the true version is after "Opera" or after
    // "Version"
    if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	return "Opera";
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	return "Chrome";
    }
    // In Safari, the true version is after "Safari" or after
    // "Version"
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	return "Safari";
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	return "Firefox";
    }
    // In most other browsers, "name/version" is at the end of
    // userAgent
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
              (verOffset=nAgt.lastIndexOf('/')) ) {
	browserName = nAgt.substring(nameOffset,verOffset);
	if (browserName.toLowerCase()==browserName.toUpperCase()) {
	    return navigator.appName;
	}
    }
}

function get_really_high_res_time() {
    if (detect_browser() != 'Safari' && 
	detect_browser() != 'node' &&
	detect_browser() != 'd8') {
        return window.performance.now();
    }
    else {
        return Date.now();
    }
}

/*
 * Send the call object to whatever storage device we're using.
 */ 
function eject(call) {
    if (detect_browser() == 'd8') {
	;//print("{ from: "+ call.from + "}");
    }
    else if (detect_browser() != 'node' && detect_browser() != 'd8' ) {
	document.writeln("<p> Call Entry Time is: "+call.entry +'  Call Exit time is: '+ call.exit+'<br>Calling from ==> '+call.from+'()'+ '<br>Calling via =>'+call.via+'()'+'<br>Calling to =>'+call.to+'()'+" </p> ");
	var socket = io.connect('http://localhost:8590');
	socket.on('init',function (data) {
	    if (data == 'start') {
		socket.emit('gobjects',JSON.stringify(call)); 
		//socket.emit('gobjects','end');
	    }		
	});
    }
    else
	console.log(call);
}

function log_call(caller, callee, thunk, these, from_new) {
    var call = {
	entry: 0, 
	exit: 0,
	from: caller,
	via: callee,
	to: null
    };  
    var megatron_ret, actual_ret;

    call.entry = get_really_high_res_time();
    megatron_ret = thunk.call(these);
    call.exit = get_really_high_res_time();
    
    if ((typeof megatron_ret != "object" && 
	 typeof megatron_ret != "function") ||
	megatron_ret === null ||
	!("__megatron_function_id" in megatron_ret)) {
	// This can happen if the call is to an application edge
	// (console.log, a library function, anything we don't
	// rewrite.) In this case, we just have to assume that via is
	// the ground truth, and return whatever we got out of the
	// function.
	call.to = null;
	actual_ret = megatron_ret;
    } else {
	call.to = megatron_ret.__megatron_function_id;
	if (from_new) {
	    actual_ret = megatron_ret.__megatron_this;
	} else {
	    actual_ret = megatron_ret.__megatron_ret;
	}
    }
    
    
    // do something with the call object
    eject(call);
    
    return actual_ret;
}


function megatron_wrap(from, via, fid) {
    return function () {
	return log_call(from, via, 
			function () {return fid.apply(this, arguments);}, 
			null, false);
    };
}
