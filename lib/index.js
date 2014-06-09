var fs = require('fs');

var express = require('express'),
	cookieParser = require('cookie-parser'),
	session = require('express-session');

var WebSocketServer = require('ws').Server;

var names = require('./names');
var HASH_KEY = '__helpchat_hash';

var Handlebars = require('handlebars');

module.exports = function(opt) {
	opt = {}; // ignore options for now
	var wsPort = opt.port || 51234;

	var wss = new WebSocketServer({
		port: wsPort
	});

	app = express();

	app.use(cookieParser());
	app.use(session({
		secret: 'http://xkcd.com/1305/',
		proxy: true
	}));

	// serve js files
	app.get('/handlebars.js', function(req, res, next) {
		return fs
			.createReadStream(__dirname + '/../node_modules/handlebars/dist/handlebars.min.js')
			.pipe(res);
	});
	app.use(express.static(__dirname + '/../client'));

	app.use(function(req, res, next) {
		if (req.path != '/') {
			// ignore everything but the root path
			return res.send(404);
		}

		var hash = req.session[HASH_KEY],
			query = require('url').parse(req.url).query;

		// if there is no query string
		if (!query) {
			// no hash exists for user
			if (!hash) {
				// generate one
				hash = names.getName().hash;
				req.session[HASH_KEY] = hash;
				return res.redirect('?' + hash);
			} else {
				// else visit our assigned hash
				return res.redirect('?' + hash);
			}
		} else {
			// if the query string is wrong, get a new one
			if (hash != query) {
				return res.redirect(req.originalUrl.split('?')[0]);
			}
		}

		return next();
	});

	// render page
	var template = Handlebars.compile(fs.readFileSync(__dirname + '/../views/chat.hbs').toString());

	app.use(function(req, res) {
		res.send(template({
			port: wsPort
		}));
	})

	var mostRecentMessages = [],
		mostRecentMessagesCount = 25,
		onlineUsers = [];
	wss.broadcast = function(data) {
		for (var i in this.clients) {
			this.clients[i].send(data);
		}
	};
	wss.on('connection', function(ws) {
		var name;
		ws.on('message', function(message) {
			var data = {};
			try {
				data = JSON.parse(message);
			} catch (e) {
				console.log('bad message, ignoring "%s"', message);
				return;
			}

			name = names.checkHash(data.hash);
			if (name) {
				if (data.type == 'verify') {
					// if a user connects twice, that's fine
					onlineUsers.push(name);

					wss.broadcast(JSON.stringify({
						type: 'user.join',
						user: name,
						online: getUnique(onlineUsers),
						time: +new Date
					}));

					ws.send(JSON.stringify({
						type: "verified",
						name: name,
						recent: mostRecentMessages,
						online: getUnique(onlineUsers)
					}));
					console.log('%s connected', name);
				} else if (data.type == 'message') {
					var message = {
						type: 'message',
						name: name,
						time: +new Date,
						message: data.message
					};
					wss.broadcast(JSON.stringify(message));
					mostRecentMessages.push(message);
					if (mostRecentMessages.length > mostRecentMessagesCount) {
						mostRecentMessages.shift();
					}
					console.log('%s: %s', name, data.message);
				}
			} else {
				// we don't care for frauds
				// console.log('fraudulent hash, %s', data.hash);
			}
		});

		ws.on('close', function(message) {
			if (name) {
				onlineUsers.splice(onlineUsers.indexOf(name), 1);

				wss.broadcast(JSON.stringify({
					type: 'user.leave',
					user: name,
					online: getUnique(onlineUsers),
					time: +new Date
				}));

				console.log('%s left', name);
			}
		});
	});

	function getUnique(list) {
		var u = {},
			a = [];
		for (var i = 0, l = list.length; i < l; ++i) {
			if (u.hasOwnProperty(list[i])) {
				continue;
			}
			a.push(list[i]);
			u[list[i]] = 1;
		}
		return a;
	}

	return app;
};