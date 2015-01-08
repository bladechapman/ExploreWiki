var jsdom = require('jsdom');
var http = require('http');
var qs = require('querystring');
http.createServer(function (req, res) {
	if(req.method == 'POST') {
		var buffer = "";
		req.on('data', function(data) {
			buffer += data;
			if (buffer.length > 1e6)
				request.connection.destroy();
		})
		req.on('end', function() {
			console.log(qs.parse(buffer));
		})
	}

	jsdom.env(
		"http://wikipedia.org/",
		["http://code.jquery.com/jquery.js"],
		function (errors, window) {
			var links = window.$("a");

			var buffer = ""
			for(var i in links) {
				if(links[i].href && links[i].href.indexOf("wikipedia.org") > -1) {
					buffer += links[i].href + '\n'
				}
			}

			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(buffer);
		}
	);



}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');