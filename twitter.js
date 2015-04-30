var Twitter = require('twitter');
var PushBullet = require('pushbullet');
var pfio = require('piface-node');

pfio.init();

// config for strings, credentials for twitter, twilio and pushbullet git ignored
var config = require('./config.json');
var credentials = require('./credentials.json');

var twilio = require('twilio')(credentials.account_sid, credentials.auth_token);

var client = new Twitter({
  consumer_key: credentials.twitter_consumer_key,
  consumer_secret: credentials.twitter_consumer_secret,
  access_token_key: credentials.twitter_access_token_key,
  access_token_secret: credentials.twitter_access_token_secret
});

var pusher = new PushBullet(credentials.pushbullet_key);

// var for not sending too much sms - by now with bad setTimeout
// TODO: change for performance
var isBusy = false;
var isPowered = false;
var waittime = 10000;

// hastag/searchterm for API
//var searchTerm = "nodejs";
var searchTerm = "#Sascha,#nsa,#angelamerkel,#dasinternetistkaputt,#habenichtszuverbergen,#lassunsreden";


function powerUp () {
  isPowered = true;
  pfio.digital_write(0,1);
}

function powerDown () {
  isPowered = false;
  pfio.digital_write(0,0);
}

// start reading stream
function startStream (conn) {

	console.log("starting stream");

 	client.stream('statuses/filter', {track:searchTerm}, function(stream) {
    		stream.on('data', function(tweet) {
      			console.log("@" + tweet.user.screen_name + " tweeted: " + tweet.text);
      			var tweetObject = {text:tweet.text, user:tweet.user.screen_name, time:tweet.created_at, location:tweet.user.location, userpic:tweet.user.profile_image_url};
	 		      //sendSMS(tweet.text);
            sendNotification(tweet.user.screen_name, tweet.text);

            if (!isPowered) powerUp();

            setTimeout(powerDown, 3000);

		});

		stream.on('error', function(error) {
      sendAlertNotification();
      // sendSMS("nodejs server error!");
      throw error;
  		});
	});
}

// for monitoring
function sendNotification (usr, txt) {
    // pushbullet: send to macbook for monitoring
    pusher.note(credentials.pushbullet_device_id_macbook, usr, txt, function(error, response) {
    // response is the JSON response from the API
    //console.log("pusher.note: " + response);
  });
}

// for emergency reasons
function sendAlertNotification () {
    // pushbullet
    pusher.note(credentials.pushbullet_device_id_macbook, config.pushbullet_msg_title, config.pushbullet_msg_body, function(error, response) {
    // response is the JSON response from the API
    console.log("pusher.note: " + response);
  });
}

// send short message via twilio api
function sendSMS (msg) {
  console.log("sendSMS");

  isBusy = true;

  twilio.sms.messages.create({
    to: credentials.num_to_text,
    from: credentials.twilio_num,
    body: msg
  }, function(error, message) {
    if (!error) {
      console.log('Success! The SID for this SMS message is:');
      console.log(message.sid);
      console.log('Message sent on:');
      console.log(message.dateCreated);

      // TODO: change to more performant code -> setTimeout
      setTimeout(resetStatus, waittime);
    }
  });
}

// reset status
function resetStatus () {
  console.log("resetStatus");
  isBusy = false;
}

// go
startStream();
