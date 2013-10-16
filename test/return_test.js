function single_return(n) {
    return n;
}

function multiple_returns(n) {
    if (n == 0) {
	return 0;
    } else if (n == 1) {
	return 0;
    } else if (n == 2) {
	return 1;
    } else {
	return multiple_returns(n - 1) + multiple_returns(n - 2);
    }
}

var a = (function (n) {return n * n});
