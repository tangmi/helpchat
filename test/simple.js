var helpchat = require('..');

var express = require('express'),
	app = express();

app.use(helpchat());

app.get('/', function(req, res) {
	res.send('im a page');
})

var server = app.listen(9000, function() {
	console.log('listening on port %s', server.address().port)
});