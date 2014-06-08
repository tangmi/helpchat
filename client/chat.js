function Client(hash) {
	this.hash = hash;
	this.name = '';
	this.connection = connection = new WebSocket('ws://' + window.location.hostname + ':51234', ['soap', 'xmpp']);

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

};

Client.prototype.send = function(msg) {
	this.connection.send(JSON.stringify({
		type: 'msg',
		hash: this.hash,
		msg: msg
	}));
};

Client.prototype.onmessage = function(cb) {
	var _this = this;
	this.connection.onmessage = function(e) {
		var data = JSON.parse(e.data);
		if (data.type == 'name') {
			console.log('assigned name, %s', data.name);
			_this.name = data.name;
		} else if (data.type == 'msg') {
			cb(data);
		}
	};
};

var messages = [];

var ws = new Client(location.search.substr(1));

ws.onmessage(function(e) {
	messages.push(e);
	if(messages.length > 25) {
		messages.shift();
	}
	render();
});

function render() {
	var messagesUl = document.getElementById('messages');
	var frag = document.createElement('div');

	for(var i = 0; i < messages.length; i++) {
		var message = messages[i];
		var li = document.createElement('li');
		li.innerHTML = message.name + ': ' + message.msg;
		console.log(ws.name);
		if(message.name == ws.name) {
			li.innerHTML = '*' + li.innerHTML;
		}
		frag.appendChild(li);
	}

	messagesUl.innerHTML = frag.innerHTML;
}

window.onload = function() {
	document.forms['chat-input'].onsubmit = function(e) {
		e.preventDefault();
		ws.send(this['message'].value);
		this['message'].value = '';
	};
};