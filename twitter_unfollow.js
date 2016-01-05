"use strict";

var Twitter = require('twitter');
var natural = require('natural');
var KalimatDariTwitter = require('strsplit');
var fs = require('fs');
var S = require('string');
var mysql = require('mysql');
var async = require('async');
var colors = require('colors');
var stringify = require('json-stringify-safe');
var d = require('domain').create();
var request = require('request');
var safeParse = require("safe-json-parse/callback");
var stringify = require('json-stringify-safe');
//require('events').EventEmitter.prototype._maxListeners = 100;
//----------------------------------------------------------------------

var dbhost     = process.env['MYSQLS_HOSTNAME'] || 'igo.gram';
var dbport     = process.env['MYSQLS_PORT'] || 3306;
var dbuser     = process.env['MYSQLS_USERNAME'] || 'igo.gram';
var dbpassword = process.env['MYSQLS_PASSWORD'] || 'igo.gram';
var dbdatabase = process.env['MYSQLS_DATABASE'] || 'igo.gram';  

var client = new Twitter({
  //Asisten bot geje V2
  consumer_key: 'bot_geje_igo_gram',
  consumer_secret: 'bot_geje_igo_gram',
  access_token_key: 'bot_geje_igo_gram-bot_geje_igo_gram',
  access_token_secret: 'bot_geje_igo_gram'
});


//--------------------------------------------------------------------------------
var global_unfollow_konter = 0;
function unfollower(){

async.waterfall([
    function(callback) {

        callback(null, 'one');
    },
    function(arg1, callback) {
        var KoneksiStatusFollowBot = mysql.createConnection({
        host     : dbhost,    
        port     : dbport,
        user     : dbuser,
        password : dbpassword,
        database : dbdatabase, 
        insecureAuth: true
        });
        
        KoneksiStatusFollowBot.connect();
        KoneksiStatusFollowBot.query('SELECT * FROM status_follow_bot WHERE following = 1 AND follower = 0 ', function(err, HasilQuery) {
          if (err) {
             console.log('mysql: ' + err);
                 //--- reset
                 global_unfollow_konter = 0;
                 angka_triger_unfollower = 0; // reset konter utama
                 //----
          } else {      
              if (HasilQuery.length > 0) {
                  console.log('panjang: ' + HasilQuery.length  + ' ' + global_unfollow_konter);
                 
                  var buferTwet = stringify(HasilQuery, null, 2);
                  safeParse(buferTwet, function (err, json) {
                   if (err){
                       console.log('parse error');
                       //--- reset
                       global_unfollow_konter = 0;
                       angka_triger_unfollower = 0; // reset konter utama
                       //----
                    } else {
                      callback(null, json);
                    }
                 });  
              } else {
                 console.log('break: rutin sudah selesai');
                 //--- reset
                 global_unfollow_konter = 0;
                 angka_triger_unfollower = 0; // reset konter utama
                 //----

              }
          }    
        });
        KoneksiStatusFollowBot.end();
    },
    function(arg1, callback) {
      //console.log(arg1[0].user_id);
 
      // 
          client.post('friendships/destroy', {user_id: arg1[global_unfollow_konter].user_id},  function(err, tweets, response){
          // Friendship request
          //API: screen_name, user_id 
          // https://dev.twitter.com/rest/reference/post/friendships/create
          // https://dev.twitter.com/overview/api/users
          if (err) {
              console.log('error: friendships/destroy ' + stringify(err, null, 2));
              //--- reset
              global_unfollow_konter = 0;
              angka_triger_unfollower = 0; // reset konter utama
              //----
          } else {    
              console.log('user ID ' + arg1[global_unfollow_konter].user_id + ' telah di unfollow');
              callback(null, arg1);
          } 
          });
        
      //  
    },
    function(arg1, callback) {

            console.log(arg1.length);
            var tmp_user_id = arg1[global_unfollow_konter].user_id ;
            var tmp_following = '0' ;
            var tmp_followback = '0';
            
            var KoneksiStatusFollowBot = mysql.createConnection({
            host     : dbhost,    
            port     : dbport,
            user     : dbuser,
            password : dbpassword,
            database : dbdatabase, 
            insecureAuth: true
            });
            
            KoneksiStatusFollowBot.connect();
            KoneksiStatusFollowBot.query('UPDATE status_follow_bot SET following='+mysql.escape(tmp_following)+', followback='+mysql.escape(tmp_followback)+' WHERE user_id='+mysql.escape(tmp_user_id)+' ', function(err, HasilQuery) {
              if (err) {
                console.log('mysql: ' + err);
                 //--- reset
                 global_unfollow_konter = 0;
                 angka_triger_unfollower = 0; // reset konter utama
                 //----
              } else {      
                 console.log('berhasil update database ' + tmp_user_id);
                 callback(null, 'mari');
              }    
            });
            KoneksiStatusFollowBot.end();              
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
    console.log(err);
    console.log(result);
    //--- reset
    global_unfollow_konter = 0;
    angka_triger_unfollower = 0; // reset konter utama
    //----
});

}
   
var angka_triger_unfollower = 0;
exports.StartUnfollow = function DataUpload(callback){
setInterval(function(){

++angka_triger_unfollower;
//console.log(angka_triger_unfollower);
 if (angka_triger_unfollower == 15){
     unfollower();
 }
}, 1000);  

}

