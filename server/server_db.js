var http = require('http');
var db = require('mongodb');

db.connect('mongodb://localhost:2001/exploreWiki', function(err, db) {
	if (!err) { console.log('we are connected to the db'); }


})

http.createServer(function(req, res) {
}).listen(1338, '127.0.0.1')
console.log('Server running at http://127.0.0.1:1338/');