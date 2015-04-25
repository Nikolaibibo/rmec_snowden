var Twitter = require('twitter');
var config = require('./config.json');

var client = new Twitter({
  consumer_key: config.twitter_consumer_key,
  consumer_secret: config.twitter_consumer_secret,
  access_token_key: config.twitter_access_token_key,
  access_token_secret: config.twitter_access_token_secret
});


var searchTerm = "javascript";

function startStream (conn) {

	console.log("starting stream");

 	client.stream('statuses/filter', {track:searchTerm}, function(stream) {
    		stream.on('data', function(tweet) {
      			console.log("@" + tweet.user.screen_name + " tweeted: " + tweet.text);
      			var tweetObject = {text:tweet.text, user:tweet.user.screen_name, time:tweet.created_at, location:tweet.user.location, userpic:tweet.user.profile_image_url};
	 		//console.log(tweetObject);
			 //io.emit('tweet', tweetObject);

		});

		stream.on('error', function(error) {
			throw error;
  		});
	});
}

startStream();
