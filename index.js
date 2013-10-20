var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , querystring = require('querystring');

app.listen(8590);

function handler (req, res) {
  
  var url_parts = url.parse(req.url);
  console.log(url_parts.path);
  var path;
  var post_data = '';
  
  if (url_parts.path == '/graph') {
	path = '/public/graph.html';  
	}

	if (url_parts.path == '/bootstrap.css') {
	path = '/public/bootstrap.css';  
	}
	
	if (url_parts.path == '/springy.js') {
	path = '/public/springy.js';  
	}
	
	if (url_parts.path == '/jumbotron-narrow.css') {
	path = '/public/jumbotron-narrow.css';  
	}
	
	if (url_parts.path == '/springyui.js') {
	path = '/public/springyui.js';  
	}
	
	if (url_parts.path == '/') {
	path = '/public/index.html';  
	}
	 
 
	 
	 fs.readFile(__dirname + path,
	 function (err,data) {
	  if(err) {
		  res.writeHead(500);
		  return res.end("Error loading");
		}
		if(req.method == 'POST') {
			req.on('data',function(chunk){
				post_data += chunk.toString();
			});
			req.on('end',function() {
			var decbody = querystring.parse(post_data);
			console.log("===============");
			console.log(decbody.code);
			console.log("===============");
			});
		}
		
		res.writeHead(200);
		res.end(data);
	});
}

io.sockets.on('connection', function (socket) {
	// Adding Sample Call object which I will receive from another function
	// Server will emit graph signal to FE and send the call object.
	//var call = {func_name: 'world'};
	//socket.emit('graph', JSON.stringify(call));
	
	
	var call = {caller: 'func1', callee: 'func2'};  // caller object info.
	var call1 = {caller: 'func3', callee: 'func4'};  // caller object info.
	socket.emit('graph', JSON.stringify(call));
	//setTimeout(function(){},2000);
	socket.emit('graph', JSON.stringify(call1));
	
	
	//socket.on('ack', function (data) {
    //console.log(data);
    
    // When all the graph objects are sent. final end connection signal.
    var end = {status:'complete'} ;
	socket.emit('end',JSON.stringify(end));
  });


