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
            angka_triger_follower = 0;
          } else {  
                  //fs.writeFile('api_followers_list.json', stringify(tweets, null, 2), function (err) {
                  //  if (err) return console.log(err);
                  //});
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
              if (global_cursor === 0){
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
                 //---
        
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
            var download = function(uri, filename, callback){
              request.head(uri, function(err, res, body){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
            
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
              });
            };
            
            fs.mkdir('./public/foto_profil/'+tmp_screen_name, 0777, function(err) {
            if(err) {

            } else {
              download(alamat_profil, './public/foto_profil/'+tmp_screen_name+'/'+tmp_screen_name+'.jpg', function(){
                console.log('done');
              });
            }
            
            });


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
    //---
});

 }

//--------------------------------------------------------------------------------
var global_folbek_konter = 0;
function folbek_folower(){

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
        KoneksiStatusFollowBot.query('SELECT * FROM status_follow_bot WHERE follower = 1 AND followback = 0 LIMIT 10 ', function(err, HasilQuery) {
          if (err) {
             console.log('mysql: ' + err);
             //angka_triger_folbek = 0; // reset konter utama
            
          } else {      
                 if (HasilQuery.length > 0 ) {
                 //console.log(HasilQuery);
                 
                     var buferTwet = stringify(HasilQuery, null, 2);
                     safeParse(buferTwet, function (err, json) {
                       if (err){
                           console.log('parse error');
                       } else {
                           callback(null, json);
                       }
                     });  
                 } else {
                        console.log('break: rutin sudah selesai ' + global_folbek_konter + ' ' + HasilQuery.length);
                        angka_triger_folbek = 0; // reset konter utama
                 }
          }    
        });
        KoneksiStatusFollowBot.end();
    },
    function(arg1, callback) {
      //console.log(arg1[0].user_id);
      // 
          client.post('friendships/create', {user_id: arg1[global_folbek_konter].user_id},  function(err, tweets, response){
          // Friendship request
          //API: screen_name, user_id 
          // https://dev.twitter.com/rest/reference/post/friendships/create
          // https://dev.twitter.com/overview/api/users
          if (err) {
              console.log('error: friendships/create ' + stringify(err, null, 2));
              // throw err;
              //angka_triger_folbek = 0; // reset konter utama
              //callback(null, 'dua error');
          } else {    
              console.log('user ID ' + arg1[global_folbek_konter].user_id + ' telah difolbek');
              callback(null, arg1);
          } 
          });
        
      //  
    },
    function(arg1, callback) {

            console.log(arg1.length);
            var tmp_user_id = arg1[global_folbek_konter].user_id ;
            var tmp_following = '1' ;
            var tmp_followback = '1';
            
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
                //angka_triger_folbek = 0; // reset konter utama
                // throw err;
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
    angka_triger_folbek = 0;
});
    
}



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
             //angka_triger_unfollower = 0; // reset konter utama
          } else {      
                 if (HasilQuery.length > 0) {
                     console.log('panjang: ' + HasilQuery.length  + ' ' + global_unfollow_konter);
                     //++global_unfollow_konter;   

                     var buferTwet = stringify(HasilQuery, null, 2);
                     safeParse(buferTwet, function (err, json) {
                       if (err){
                           console.log('parse error');
                       } else {
                              callback(null, json);
                       }
                     });  
                  } else {
                         console.log('break: rutin sudah selesai');
                         angka_triger_unfollower = 0; // reset konter utama
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
                 angka_triger_unfollower = 0; // reset konter utama
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
                //angka_triger_unfollower = 0; // reset konter utama
 
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
    angka_triger_unfollower = 0;
});

}
   

var angka_triger_follower = 0;
var angka_triger_folbek = 0;
var angka_triger_unfollower = 0;
setInterval(function(){
++angka_triger_follower;
//console.log(angka_triger_follower);
 if (angka_triger_follower == 15){
     masukan_data_folower(); 
 }  
++angka_triger_folbek;
//console.log(angka_triger_folbek);
 if (angka_triger_folbek == 15){
     //folbek_folower();
 } 
++angka_triger_unfollower;
//console.log(angka_triger_unfollower);
 if (angka_triger_unfollower == 15){
     //unfollower();
 }
}, 1000);  



