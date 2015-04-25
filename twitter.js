var Twitter = require('twitter');
var PushBullet = require('pushbullet');

var config = require('./config.json');

var twilio = require('twilio')(config.account_sid, config.auth_token);

var client = new Twitter({
  consumer_key: config.twitter_consumer_key,
  consumer_secret: config.twitter_consumer_secret,
  access_token_key: config.twitter_access_token_key,
  access_token_secret: config.twitter_access_token_secret
});

var pusher = new PushBullet(config.pushbullet_key);

var isBusy = false;
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
      // sendSMS("nodejs server error!");

      throw error;
  		});
	});
}

function sendNotification () {
  // pushbullet
  pusher.note(config.pushbullet_device_id_iphone, config.pushbullet_msg_title, config.pushbullet_msg_title, function(error, response) {
    // response is the JSON response from the API
    console.log("pusher.note: " + response);
  });
}

function sendSMS (msg) {
  console.log("sendSMS");

  isBusy = true;

  twilio.sms.messages.create({
    to: config.num_to_text,
    from: config.twilio_num,
    body: msg
  }, function(error, message) {
    if (!error) {
      console.log('Success! The SID for this SMS message is:');
      console.log(message.sid);
      console.log('Message sent on:');
      console.log(message.dateCreated);

      setTimeout(resetStatus, 10000);
    }
  });
}

function resetStatus () {
  console.log("resetStatus");
  isBusy = false;
}


startStream();
