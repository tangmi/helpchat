var fs = require('fs');

var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('express-session');

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: 51234
	});

var names = require('./names');
var HASH_KEY = '__helpchat_hash';

app = express();

app.use(cookieParser());
app.use(session({
	secret: 'helpchat 1305',
	proxy: true
}));

// serve hs
app.use(function(req, res, next) {
	if (req.path == '/help/chat/chat.js') {
		return fs
			.createReadStream(__dirname + '/../client/chat.js')
			.pipe(res);
	}

	next();
});

app.use(function(req, res, next) {
	if (req.path == '/help/chat' || req.path == '/help/chat/') {
		var hash = req.session[HASH_KEY],
			query = require('url').parse(req.url).query;

		// if there is no query string
		if (!query) {
			// no hash exists for user
			if (!hash) {
				// generate one
				hash = names.getName().hash;
				req.session[HASH_KEY] = hash;
				return res.redirect(req.path + '?' + hash);
			} else {
				// else visit our assigned hash
				return res.redirect(req.path + '?' + hash);
			}
		} else {
			// if the query string is wrong, get a new one
			if (hash != query) {
				return res.redirect(req.path);
			}
		}
	}

	next();
});

// render the page
app.use(function(req, res, next) {
	if (req.path == '/help/chat' || req.path == '/help/chat/') {
		return fs
			.createReadStream(__dirname + '/../views/chat.html')
			.pipe(res);
	}

	next();
});



wss.broadcast = function(data) {
	for (var i in this.clients) {
		this.clients[i].send(data);
	}
};
wss.on('connection', function(ws) {
	ws.on('message', function(message) {
		var data = {};
		try {
			data = JSON.parse(message);
		} catch (e) {
			console.log('bad message, ignoring "%s"', message);
			return;
		}

		var name = names.checkHash(data.hash);
		if (name) {
			if (data.type == 'verify') {
				ws.send(JSON.stringify({
					type: "name",
					name: name
				}));
				console.log('%s connected', name);
			} else if (data.type == 'msg') {
				wss.broadcast(JSON.stringify({
					type: "msg",
					name: name,
					time: +new Date,
					msg: data.msg
				}));
				console.log('%s: %s', name, data.msg);
			}
		} else {
			// we don't care for frauds
		}
	});
});

module.exports = function(opt) {
	return app;
};