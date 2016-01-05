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

client.get('statuses/user_timeline', {screen_name: 'bot_geje', count:1}, function(err, tweets, response){
if (err) {
    console.log('statuses/user_timeline ' + err);
    // throw err;
} else {    
  console.log('statuses/user_timeline: response ' + response);
  //console.log(util.inspect(response, false, 3));
  inspect(tweets);

   fs.writeFile('tweet_api.json', stringify(tweets, null, 2), function (err) {
   if (err) return console.log(err);
      //console.log('Hello World > helloworld.txt');
   });
} 
}); 

/*
client.get('statuses/mentions_timeline', {count:1}, function(err, tweets, response){
//
// https://dev.twitter.com/rest/reference/get/statuses/mentions_timeline  
if (err) {
    console.log('statuses/mentions_timeline ' + err);
    // throw err;
} else {    
	console.log('search/tweets: response ' + response);
	//console.log(util.inspect(response, false, 3));
	inspect(tweets);

   fs.writeFile('tweet_api.json', stringify(tweets, null, 2), function (err) {
   if (err) return console.log(err);
      //console.log('Hello World > helloworld.txt');
   });
}	
});	




client.post('statuses/update', {status: '@bot_geje ouououaaa', in_reply_to_status_id: '617393487462461400'},  function(err, tweets, response){
//Reply status berdasarkan id twets
//https://dev.twitter.com/overview/api/tweets
if (err) {
    console.log('statuses/mentions_timeline ' + err);
    // throw err;
} else {    
  console.log('search/tweets: response ' + response);
  //console.log(util.inspect(response, false, 3));
  inspect(tweets);
} 
});
*/

client.post('statuses/update', {status: '@bot_geje in reply ', in_reply_to_screen_name: 'bot_geje'},  function(err, tweets, response){
//Mention
//API: in_reply_to_screen_name, in_reply_to_user_id
// https://dev.twitter.com/rest/reference/post/statuses/update
// https://dev.twitter.com/overview/api/tweets
if (err) {
    console.log('statuses/mentions_timeline ' + err);
    // throw err;
} else {    
  console.log('search/tweets: response ' + response);
  //console.log(util.inspect(response, false, 3));
  inspect(tweets);
} 
});