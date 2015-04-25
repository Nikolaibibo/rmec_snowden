var Twitter = require('twitter');
var PushBullet = require('pushbullet');

var config = require('./config.json');

var client = new Twitter({
  consumer_key: config.twitter_consumer_key,
  consumer_secret: config.twitter_consumer_secret,
  access_token_key: config.twitter_access_token_key,
  access_token_secret: config.twitter_access_token_secret
});

var pusher = new PushBullet(config.pushbullet_key);


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
      sendNotification();
			throw error;
  		});
	});
}

function sendNotification () {
  pusher.note(config.pushbullet_device_id_iphone, config.pushbullet_msg_title, config.pushbullet_msg_title, function(error, response) {
    // response is the JSON response from the API
    console.log("pusher.note: " + response);
});


}

startStream();
