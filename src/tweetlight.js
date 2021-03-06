var jsonp = {
	callbackCounter: 0,
	fetch: function(url, callback) {
		var fn = 'Callback_' + this.callbackCounter++;
		window[fn] = this.evalJSONP(callback);
		url = url.replace('=Callback', '=' + fn);
		
		var scriptTag = document.createElement('SCRIPT');
		scriptTag.src = url;
		document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
	},
	evalJSONP: function(callback) {
		return function(data) {
			var validJSON = false;
			if(typeof data === "string"){
				try {
					validJSON = JSON.parse(data);
				} catch (e) {
					/*invalid JSON*/	
				}
			} else {
				validJSON = JSON.parse(JSON.stringify(data));	
			}
			if (validJSON) {
                callback(validJSON);
            } else {
                throw("JSONP call returned invalid or empty JSON");
            }
		}
	}
}

var K = function () {
	var a = navigator.userAgent;
	return {
		ie: a.match(/MSIE\s([^;]*)/)
	}
}();

var Tweetlight = {
	init: function(config) {
        this.url = "https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name="+config.username+"&count="+config.count+"&callback=Callback",
		this.fetch();
    },
	fetch: function() {
		var self = this;
		
		jsonp.fetch(this.url, function(tweets) {
			var timeline = document.getElementById('tweets'),
			content = '';
			for (var t in tweets) {
				content += '<li><span class="tweet">'+Tweetlight.twitterLinks(tweets[t].text)+'</span> <span class="created">'+Tweetlight.prettyDate(tweets[t].created_at)+'</span></li>';
			}
  			timeline.innerHTML = content;	
		});
	},
	prettyDate: function(a) {
		var b = new Date();
		var c = new Date(a);
		if (K.ie) {
			c = Date.parse(a.replace(/( \+)/, ' UTC$1'))
		}
		var d = b - c;
		var e = 1000,
			minute = e * 60,
			hour = minute * 60,
			day = hour * 24,
			week = day * 7;
		if (isNaN(d) || d < 0) {
			return ""
		}
		if (d < e * 7) {
			return "just now"
		}
		if (d < minute) {
			return Math.floor(d / e) + " seconds ago"
		}
		if (d < minute * 2) {
			return "1 minute ago"
		}
		if (d < hour) {
			return Math.floor(d / minute) + " minutes ago"
		}
		if (d < hour * 2) {
			return "1 hour ago"
		}
		if (d < day) {
			return Math.floor(d / hour) + " hours ago"
		}
		if (d > day && d < day * 2) {
			return "yesterday"
		}
		if (d < day * 365) {
			return Math.floor(d / day) + " days ago"
		} else {
			return "over a year ago"
		}
	},
	twitterLinks: function(text) {
		text = text.replace(/(https?:\/\/)([\w\-:;?&=+.%#\/]+)/gi, '<a href="$1$2">$2</a>')
		.replace(/(^|\W)@(\w+)/g, '$1<a href="https://twitter.com/$2">@$2</a>')
		.replace(/(^|\W)#(\w+)/g, '$1<a href="https://search.twitter.com/search?q=%23$2">#$2</a>');
		return text
	}
}