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

var global_cursor = -1;
var global_follower_konter = -1;

function masukan_data_folower(){

console.time('_1');
console.time('_2');
async.waterfall([
    function(callback) {
        ++global_follower_konter;
        callback(null, 'one');
    },  
    function(arg1, callback) {

       client.get('followers/list', {cursor: global_cursor, count: '200'}, function(err, tweets, response){
          if(err) {
            console.log('error: followers/list ' + stringify(err, null, 2));
            //--- reset
            global_follower_konter = -1;
            angka_triger_follower = 0;
            //----
          } else {  
                  
                 global_cursor = tweets.next_cursor;
                 console.timeEnd('_1');
                var buferTwet = stringify(tweets, null, 2);
                safeParse(buferTwet, function (err, json) {
                  if (err){
                     console.log('parse error');
                  } else {
                    callback(null, json);
                  }
                });  
                                                    
          }
       });

    },
    function(arg1, callback) {
      console.log('global kursor: ' + global_cursor);
              if (global_cursor == 0){
                 global_cursor = (-1);
              }
      console.log(global_follower_konter + ' coek ' + arg1.users.length);
              if (global_follower_konter < arg1.users.length-1){ 
                 callback(null, arg1);         
              } else {
                 console.log('twets selesai');
                 //--- reset
                 global_follower_konter = -1;
                 angka_triger_follower = 0;
                 //----
        
              }
    },
    function(arg1, callback) {
       //console.log(arg1);

            //console.log(arg1.users.length);
            var tmp_user_id = arg1.users[global_follower_konter].id ;
            var tmp_name = arg1.users[global_follower_konter].name ;
            var tmp_screen_name = arg1.users[global_follower_konter].screen_name ;
            var tmp_location = arg1.users[global_follower_konter].location ;
            var tmp_follower = '1'; 
            var tmp_followback = '0';
            var tmp_follow_request_sent = arg1.users[global_follower_konter].follow_request_sent ;
            var tmp_muting = arg1.users[global_follower_konter].muting ;
            var tmp_blocking = arg1.users[global_follower_konter].blocking ;
            var tmp_blocked_by = arg1.users[global_follower_konter].blocked_by ;
            var tmp_protected = arg1.users[global_follower_konter].protected ;
            var tmp_profile_image_url_https = arg1.users[global_follower_konter].profile_image_url_https ;
            var tmp_tanggal = '0';

            var alamat_profil = S(tmp_profile_image_url_https).replaceAll('_normal', '').s;
            

            var KoneksiStatusFollowerBot = mysql.createConnection({
            host     : dbhost,    
            port     : dbport,
            user     : dbuser,
            password : dbpassword,
            database : dbdatabase, 
            insecureAuth: true
            });
                   
            KoneksiStatusFollowerBot.connect();  
            KoneksiStatusFollowerBot.query('INSERT INTO status_follow_bot(user_id, name, screen_name, location, follower, followback, follow_request_sent, muting, blocking, blocked_by, protected, profile_image_url_https, tanggal ) VALUES( '+mysql.escape(tmp_user_id)+', '+mysql.escape(tmp_name)+', '+mysql.escape(tmp_screen_name)+', '+mysql.escape(tmp_location)+', '+mysql.escape(tmp_follower)+', '+mysql.escape(tmp_followback)+', '+mysql.escape(tmp_follow_request_sent)+', '+mysql.escape(tmp_muting)+', '+mysql.escape(tmp_blocking)+', '+mysql.escape(tmp_blocked_by)+', '+mysql.escape(tmp_protected)+', '+mysql.escape(tmp_profile_image_url_https)+', '+mysql.escape(tmp_tanggal)+' )', function(err, result) {
              if (err) {
                  console.log('mysql err: ' + err);
                  console.timeEnd('_2');
                  callback(null, 'three');
                } else {
                  console.log('insert data ke '+ global_follower_konter + ' selesai');
                  console.timeEnd('_2');
                  callback(null, 'three');
                }
            }); 
            KoneksiStatusFollowerBot.end(); 

    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
    console.log('err = ' + err);
    console.log('hasil = ' + result);
    //--- reset
    global_follower_konter = -1;
    angka_triger_follower = 0;
    //----
});

 }

   

var angka_triger_follower = 0;
exports.StartFollower = function DataUpload(callback){
setInterval(function(){
++angka_triger_follower;
//console.log(angka_triger_follower);
 if (angka_triger_follower == 15){
     masukan_data_folower(); 
 }  

}, 1000);  

}



//fs.writeFile('api_followers_list.json', stringify(tweets, null, 2), function (err) {
                  //  if (err) return console.log(err);
                  //});