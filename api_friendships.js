var Twitter = require('twitter');
var inspect = require('eyes').inspector({styles: {all: 'magenta', string: 'green'}});
var fs = require('fs');
var stringify = require('json-stringify-safe');

var client = new Twitter({
  //Asisten bot geje V2
  consumer_key: 'bot_geje_igo_gram',
  consumer_secret: 'bot_geje_igo_gram',
  access_token_key: 'bot_geje_igo_gram-bot_geje_igo_gram',
  access_token_secret: 'bot_geje_igo_gram'
});

client.post('friendships/create', {screen_name : 'bot_geje'},  function(err, tweets, response){
//Mention
//API: in_reply_to_screen_name, in_reply_to_user_id
// https://dev.twitter.com/rest/reference/post/friendships/create
// https://dev.twitter.com/overview/api/users
if (err) {
    console.log('friendships/create ' + err);
    // throw err;
} else {    
  console.log('friendships/create ' + response);
  //console.log(util.inspect(response, false, 3));
  inspect(tweets);
} 
});