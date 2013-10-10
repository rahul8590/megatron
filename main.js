var Hapi = require('hapi');
// Create a server with a host and port
var server = Hapi.createServer('localhost', 8000);
function profile (request) {
				request.reply(request.payload.code );	
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
	config: { handler: profile }
	}

]);
server.start();
