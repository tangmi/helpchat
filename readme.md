# helpchat

add a good ol' undocumented chat room to your express app

```
npm install --save helpchat
```

```
var express = require('express'),
    app = express();

app.use(require('helpchat')());

app.listen(9000);
```

[http://xkcd.com/1305/](http://xkcd.com/1305/)


## notes

this is slowly become and idea for "safe" (resistant to spam?) anonymous chatting that adds useful tools (auto embed media/images? formatting with markdown? auto-preview links?)

* links
	* media
		* preview on hover
	* unique click counter (also counts "previews" on media links)
* formatting
	* markdown
		* longer blocks are overflow-y: scroll
* scratchpad (collaborative)
	* text
	* drawing
* voting
	* users can vote posts up or down, higher upvoted stuff stays visible for longer