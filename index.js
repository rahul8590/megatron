var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , querystring = require('querystring')
  , profile = require('./src/rewrite.js');

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
	
	if (url_parts.path == '/rewrite') {
	path = '/public/rewrite.html';  
	}
	
	if (url_parts.path == '/raphael-min.js') {
	path = '/public/raphael-min.js';  
	}
	
	if (url_parts.path == '/dracula_graffle.js') {
	path = '/public/dracula_graffle.js';  
	}
	
	if (url_parts.path == '/jquery-1.4.2.min.js') {
	path = '/public/jquery-1.4.2.min.js';  
	}
	
	if (url_parts.path == '/dracula_graph.js') {
	path = '/public/dracula_graph.js';  
	}
	
	
	
	
	
	
	if(url_parts.path = '/profile' && req.method == 'POST') {
		req.on('data',function(chunk){
				post_data += chunk.toString();
			});
			req.on('end',function() {
			var decbody = querystring.parse(post_data);
			console.log("===============");
			console.log(decbody.code);
			console.log("===============");
			var code_profile = profile.profile(decbody.code);
			data = code_profile;
			fs.writeFile(__dirname+'/public/rewrite.html','<script src="/socket.io/socket.io.js"></script><script>'+code_profile+'</script><body></body>',function(err) {
				if (err) {
					console.log(err + "cannot write to rewrite.html");
				}
				else {
					console.log(" sucessfully rewrite.html ");
					
				}
			});
			res.writeHead(302,{'Location': '/rewrite'});
			res.end();
			//res.end(data);
		});
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
			var code_profile = profile.profile(decbody.code);
			res.write(code_profile);
			});
		}
		
		res.writeHead(200);
		res.end(data);
	});
}

// Maintains list of all the objects which is stremed by client
var server_list = [];

io.sockets.on('connection', function (socket) {
	
	socket.emit('init','start');
	socket.on('gobjects',function(data) {
	console.log(data);
	if (data == 'send') {
			console.log("send signal received");
			socket.emit('graph',JSON.stringify(server_list));
			console.log("from index.js after sending server_list is " + server_list.length);
			//server_list.splice(0,server_list.length); // flushing the server list so refresh will purge old objects
			//console.log("After Splicing " + server_list.length);	
		}
	else if (data =='clear') {
			server_list.splice(0,server_list.length); // flushing the server list so refresh will purge old objects
			console.log("After Splicing " + server_list.length);	
		}
	else {
			var obj = JSON.parse(data);
			console.log("object is "+obj.toString());
			server_list.push(JSON.stringify(obj)) ;
		}
	
	});
});


