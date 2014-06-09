$.get('./template.hbs', function(data) {
	var template = Handlebars.compile(data);


	var messages = [];

	var client = new Client(wsUrl, location.search.substr(1));

	client.on('verified', render)
	client.on('message', render);
	client.on('user', render);

	function render() {
		var self = client.name(),
			messages = client.messages(),
			users = client.users();

		var app = document.getElementById('react');
		
		app.innerHTML = template({
			user: self,
			messages: messages,
			users: users
		});

		relayout();

	}

	document.forms['chat-input'].onsubmit = function(e) {
		e.preventDefault();
		client.send(this['message'].value);
		this['message'].value = '';
	};
});