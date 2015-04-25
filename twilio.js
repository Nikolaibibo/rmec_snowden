var Twitter = require('twitter');
var config = require('./config.json');

var isBusy = false;

var client = new Twitter({
  consumer_key: config.twitter_consumer_key,
  consumer_secret: config.twitter_consumer_secret,
  access_token_key: config.twitter_access_token_key,
  access_token_secret: config.twitter_access_token_secret
});

client.stream('statuses/filter', {track: 'palimpalim'}, function(stream) {
  stream.on('data', function(tweet) {
    console.log("@" + tweet.user.screen_name + " said: " + tweet.text);
    if (!isBusy) sendMessage("@" + tweet.user.screen_name + " said: " + tweet.text);
  });

  stream.on('error', function(error) {
    throw error;
  });
});

var twilio = require('twilio')(config.account_sid, config.auth_token);

function sendMessage (msg) {
  console.log("sendMessage");

  isBusy = true;

  var message = "Whoop whoop, thats the sound of da police";
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


console.log("startingStream");
