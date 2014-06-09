function relayout() {
	var input = $('#input'),
		users = $('#users'),
		messages = $('#messages');

	var w = $(window).width(),
		h = $(window).height();

	var inputHeight = 50,
		usersWidth = 250;

	users.css({
		right: 0,
		width: usersWidth,
		height: '100%',
		overflowY: 'scroll'
	});

	input.css({
		bottom: 0,
		height: inputHeight,
		width: w - usersWidth + 'px',
	});

	messages.css({
		height: h - inputHeight + 'px',
		width: w - usersWidth + 'px',
		overflowY: 'scroll'
	})
}

$(window).resize(relayout);