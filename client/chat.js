(function(self) {

	function Client(wsUrl, hash) {
		this._hash = hash;
		this._name = '';
		this.connection = connection = new WebSocket(wsUrl);

		// When the connection is open, send some data to the server
		connection.onopen = function() {
			connection.send(JSON.stringify({
				type: 'verify',
				hash: hash
			}));
		};

		// Log errors
		connection.onerror = function(error) {
			console.log('WebSocket Error ' + error);
		};

		var maxMessages = 1000;
		this._messages = [];
		this._users = [];

		this._callbacks = {
			verified: noop,
			message: noop,
			user: noop
		};
		var _this = this;
		this.connection.onmessage = function(e) {
			var data = JSON.parse(e.data);
			if (data.type == 'verified') {
				console.log('assigned name, %s', data.name);
				_this._name = data.name;
				_this._messages = data.recent;
				_this._users = data.online;
				_this._callbacks['verified']();
			} else if (data.type == 'message') {
				_this._messages.push(data);
				if (_this._messages.length > maxMessages) {
					_this._messages.shift();
				}

				_this._callbacks['message'](data);
			} else if (data.type.indexOf('user') == 0) {
				_this._users = data.online;
				_this._callbacks['user'](data);
			}
		};

	};

	Client.prototype.send = function(message) {
		this.connection.send(JSON.stringify({
			type: 'message',
			hash: this._hash,
			message: message
		}));
	};

	Client.prototype.on = function(e, cb) {
		this._callbacks[e] = makeCallback(cb);
	};

	Client.prototype.name = function() {
		return this._name;
	};

	Client.prototype.messages = function() {
		return this._messages;
	};

	Client.prototype.users = function() {
		return this._users;
	};

	function makeCallback(cb) {
		if (typeof cb == 'function') {
			return cb;
		} else {
			return noop;
		}
	}

	function noop() {}

	self.Client = Client;
})(this);