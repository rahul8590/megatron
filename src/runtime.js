function get_really_high_res_time() {
    // browser-compatible
    var t0,t1,delta;
    if (detect_browser != 'Safari') {
        t0 = window.performance.now();
        // function to be called in this 
        t1 = window.performance.now();
        delta = t1 - t0;
        
    }
    else {
        t0 = Date.now();
        //function calls which are to be executed 
        t1 = Date.now();
        delta = t1 - t0;
    }
    console.log("time taken to execute is:"+delta);
    return delta;
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


function detect_browser() {
    var nAgt = navigator.userAgent;
    var browserName  = navigator.appName;
    var nameOffset,verOffset,ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
     browserName = "Opera";
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
     }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
     browserName = "Chrome";
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
     browserName = "Safari";
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
     browserName = "Firefox";
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
              (verOffset=nAgt.lastIndexOf('/')) ) 
    {
     browserName = nAgt.substring(nameOffset,verOffset);
     if (browserName.toLowerCase()==browserName.toUpperCase()) {
      browserName = navigator.appName;
     }
    }
    return browserName;
}
