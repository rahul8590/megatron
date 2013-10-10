var Hapi = require('hapi');
var profile = require('./src/rewrite.js');

// Create a server with a host and port
var server = Hapi.createServer('localhost', 8000);
function code_post (request) {
				request.reply(request.payload.code );
				var code_profile = profile.profile(request.payload.code);
				console.log(code_profile);
}
server.route([
    {
	method: 'GET',
    path: '/{path*}',
    handler: {
        directory: { path: './public', listing: false, index: true }
    	}
    },
	{
	method: 'POST',
	path: '/profile',
	//handler: { file: './public/about.html' }
	config: { handler: code_post }
	}

]);
server.start();
