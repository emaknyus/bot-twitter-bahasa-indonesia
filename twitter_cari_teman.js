"use strict";

var Twitter = require('twitter');
var inspect = require('eyes').inspector({styles: {all: 'magenta', string: 'green'}});
var fs = require('fs');
var stringify = require('json-stringify-safe');
var async = require('async');
var mysql = require('mysql');
var colors = require('colors');
var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());
var d = require('domain').create();
var S = require('string');
var request = require('request');
var unirest = require('unirest');
var safeParse = require("safe-json-parse/callback");

var cmdBotCekWajah = require('./fungsi_bot/bot_cek_wajah.js');
var cmdBotSimpanJSON = require('./fungsi_bot/bot_simpan_json.js');

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

//-------------------
var global_socket_data = [];
var global_socket_informasi_interrupt = [];

//-------------------

var Nomer_Kunci = 5;
var global_cari_teman_konter = Nomer_Kunci;
var global_nomor_urut = Nomer_Kunci; 

function utama_cari_teman(){

var jumlah_text = 90;
var global_panjang_tweet = 0;
var kata_kunci_twitter = [];

async.waterfall([
    function(callback) {
    	  global_socket_data[0] = "";
      	global_socket_data[1] = "";
      	global_socket_data[2] = "";
    	  global_socket_informasi_interrupt[0] = "";
        callback(null, 'satu');
    },
    function(arg1, callback) {
        var KoneksiDaftarKosakata = mysql.createConnection({
        host     : dbhost,    
        port     : dbport,
        user     : dbuser,
        password : dbpassword,
        database : dbdatabase, 
        insecureAuth: true
        });
        
        KoneksiDaftarKosakata.connect();
        KoneksiDaftarKosakata.query('SELECT * FROM daftar_kosakata', function(err, HasilQuery) {
            if (err) {
                console.log('mysql ' + err);
                //--- reset
                global_nomor_urut = 0;
                global_cari_teman_konter = 0;
                angka_triger_cari_teman = 0; //reset konter utama
                //--- 
 
            } else {      
              for (var i = 0; i < HasilQuery.length ; i++){
                  //console.log(HasilQuery[i].definisi);
                  kata_kunci_twitter = HasilQuery;
                  if (i == HasilQuery.length-1){
                    callback(null, 'satu');
                  }
              }
            }    
        });
        KoneksiDaftarKosakata.end();

    },
    function(arg1, callback) {
           ++global_cari_teman_konter;
           
           if (global_cari_teman_konter >= 0 && global_cari_teman_konter <= kata_kunci_twitter.length-1){
               ++global_nomor_urut;  

               callback(null, global_nomor_urut);
           } else {
                  console.log('break: data habis'.red);
                  global_socket_informasi_interrupt[0] = "query database telah selesai";            
           	      //--- reset
                  global_nomor_urut = 0;
                  global_cari_teman_konter = 0;
                  angka_triger_cari_teman = 0; //reset konter utama
                  //--- 
           }

    },
    function(arg1, callback) {
      var angka = Number(arg1);

        console.log('kata kunci pencarian : ' + kata_kunci_twitter[angka].definisi);      
        client.get('search/tweets', {q: '"'+kata_kunci_twitter[angka].definisi+'"', lang: 'in', result_type: 'mixed', count: jumlah_text}, function(err, tweets, response){
            //https://dev.twitter.com/rest/public/search 
            //https://dev.twitter.com/rest/reference/get/search/tweets
            if (err) {
                console.log('error search/tweets: ' + stringify(err, null, 2));
                 
                console.log('break: melebihi batas query twitter'.red);
                global_socket_informasi_interrupt[0] = "twitter error, melebihi batas query";
                //--- reset
                global_nomor_urut = 0;
                global_cari_teman_konter = 0;
                angka_triger_cari_teman = 0; //reset konter utama
                //---              
            } else {    
                   console.log('panjang array: ' + tweets.statuses.length);	
                   if (tweets.statuses.length < 5) {
                      console.log('break: hasil pencarian nihil'.red);
                      global_socket_informasi_interrupt[0] = "hasil pencarian nihil"; 
                      //--- reset
              		    global_nomor_urut = 0;
              		    global_cari_teman_konter = 0;
              		    angka_triger_cari_teman = 0; //reset konter utama
              		    //---
              	  
                   } else {
              	          global_panjang_tweet = random.integer(0, tweets.statuses.length);
                          var buferTwet = stringify(tweets, null, 2);
                          safeParse(buferTwet, function (err, json) {
                            if (err){
                               console.log('parse error');
                            } else {
                               callback(null, json);
                            }
                          });  
              	              	
                   }

                 }
        }); 
    },    
    function(arg1, callback) {
    	//console.log('jos: ' + arg1.statuses[global_panjang_tweet].user.id);

    //	/*
        var KoneksiStatusFollowBot = mysql.createConnection({
        host     : dbhost,    
        port     : dbport,
        user     : dbuser,
        password : dbpassword,
        database : dbdatabase, 
        insecureAuth: true
        });
        
        KoneksiStatusFollowBot.connect();
        KoneksiStatusFollowBot.query('SELECT * FROM status_follow_bot WHERE user_id='+arg1.statuses[global_panjang_tweet].user.id+' LIMIT 1 ', function(err, HasilQuery) {
          if (err) {
              console.log('mysql: ' + err);
              //--- reset
              global_nomor_urut = 0;
              global_cari_teman_konter = 0;
              angka_triger_cari_teman = 0; //reset konter utama
              //---
          } else {      
          	  if (HasilQuery.length < 1) {
          	     callback(null, arg1);
          	  } else {
          	      console.log('break: user_id sudah terdaftar kedalam database');
                  global_socket_informasi_interrupt[0] = "akun sudah masuk database";
          	      //--- reset
                  global_nomor_urut = 0;
                  global_cari_teman_konter = 0;
                  angka_triger_cari_teman = 0; //reset konter utama
                  //---  
          	  }
          }    
        });
        KoneksiStatusFollowBot.end();
     //   */
        
    },
    function(arg1, callback) {
      // arg1 now equals 'one'
         console.log('hasil id sql: ' + arg1);
      // /*
      //setTimeout(function(){
		client.post('friendships/create', {user_id: arg1.statuses[global_panjang_tweet].user.id},  function(err, tweets, response){
			// Friendship request
			//API: screen_name, user_id 
			// https://dev.twitter.com/rest/reference/post/friendships/create
			// https://dev.twitter.com/overview/api/users
			if (err) {
			    console.log('friendships/create ' + err);
			  	//--- reset
          global_nomor_urut = 0;
          global_cari_teman_konter = 0;
          angka_triger_cari_teman = 0; //reset konter utama
          //---
			} else {    
			    console.log('friendships/create ' + response);
			    callback(null, arg1);
			} 
		});
	  //}, 10000);
	  // */	
    },
    function(arg1, callback) {
   
        //console.log('reply: ' + arg1.statuses[global_panjang_tweet].user.screen_name);
        var tmp_screen_name = arg1.statuses[global_panjang_tweet].user.screen_name;
        var tmp_in_reply_to_status_id = arg1.statuses[global_panjang_tweet].id_str;
        var pesan_folbek = [];
            pesan_folbek[0] = 'Folbek dong kak @'+tmp_screen_name+' Ada marmut makand kwaci, kakak @'+tmp_screen_name+' imut maaciw ea';
            pesan_folbek[1] = 'kayake aku kenal sama kak @'+tmp_screen_name+' tp siapa ea, coba deh kakak @'+tmp_screen_name+' folbek kali aja ingat aku';
            pesan_folbek[2] = 'loh kakak @'+tmp_screen_name+' ini dulunya kan mantan gebetannya temenku, jgn lupa folbek ya kak @'+tmp_screen_name+' ';
            pesan_folbek[3] = 'kata nenek aku, banyak teman banyak rejeki, folbek ya kak @'+tmp_screen_name+' biar rejekinya tambah banyak ';
            pesan_folbek[4] = 'temenku banyak yg jomblo, coba deh kakak @'+tmp_screen_name+' folbek aku terus intip followerku, kali aja ada yg jodoh ';
            pesan_folbek[5] = 'dahulu temanku sering patah hati, setelah folbek aku mendadak dia sering hoki. gak percaya? coba folbek aja kak @'+tmp_screen_name+' ';
            pesan_folbek[6] = 'hubungan kita mau dibawa kemana?, folbek dulu kak @'+tmp_screen_name+' nanti kita jelasin';
            pesan_folbek[7] = 'udah lama aku nunggu folbek dari kakak @'+tmp_screen_name+' tapi gak segera difolbek juga :( ';
            pesan_folbek[8] = 'tanpa folbekmu kak @'+tmp_screen_name+' aku tuh lemah letih tak berdaya, jadi folbek ya kak @'+tmp_screen_name+' ';	
            pesan_folbek[9] = 'barusan aku liat gebetan kakak @'+tmp_screen_name+' jalan bareng orang, folbek dulu kak @'+tmp_screen_name+' nanti aku kasi tau';
            pesan_folbek[10] = 'hay kakak @'+tmp_screen_name+' kuh yang paling caem di dunia. jangan lupa folbek aku ea kak @'+tmp_screen_name+' ';
            pesan_folbek[11] = 'menjadi jomblo bukanlah alasan untuk tidak melakukan folbek, jangan lupa folbek aku ya kak @'+tmp_screen_name+' ';
            pesan_folbek[12] = 'pengen lekas dapat gebetan?, caranya gampang, folbek aja aku nanti kakak @'+tmp_screen_name+' tak doain lekas dpt jodoh';
            pesan_folbek[13] = '3kali folbek rejekinya brtambah, 2kali nasibnya brubah, sekali folbek aku gebetan kakak @'+tmp_screen_name+' bakal bertambah';
            //pesan_folbek[0] = 'kakak @'+tmp_screen_name+' kak @'+tmp_screen_name+' ';
            // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
        var nilai_acak = random.integer(0, pesan_folbek.length);
        /*
	    
		  client.post('statuses/update', {status: pesan_folbek[nilai_acak], in_reply_to_status_id: tmp_in_reply_to_status_id},  function(err, tweets, response){
		  //Mention
		  //API: in_reply_to_screen_name, in_reply_to_user_id, in_reply_to_status_id
		  // https://dev.twitter.com/rest/reference/post/statuses/update
		  // https://dev.twitter.com/overview/api/tweets
		   if (err) {
		     console.log('statuses/update ' + err);
		     // throw err;
		     callback(null, arg1);
		   } else {           
		     console.log('statuses/update: response ' + response);
		     //console.log(util.inspect(response, false, 3));
		     callback(null, arg1);
		   } 
		  });
         */
         callback(null, arg1);
        
    },
    function(arg1, callback) {
    	var tmp_user_id = arg1.statuses[global_panjang_tweet].user.id ;
    	var tmp_name = arg1.statuses[global_panjang_tweet].user.name ;
    	var tmp_screen_name = arg1.statuses[global_panjang_tweet].user.screen_name ;
    	var tmp_location = arg1.statuses[global_panjang_tweet].user.location ;
    	var tmp_following = '1' ;
    	var tmp_followback = '0';
    	var tmp_follow_request_sent = arg1.statuses[global_panjang_tweet].user.follow_request_sent ;
    	var tmp_muting = '0';
    	var tmp_blocking = '0';
    	var tmp_blocked_by = '0';
    	var tmp_protected = arg1.statuses[global_panjang_tweet].user.protected ;
    	var tmp_profile_image_url_https = arg1.statuses[global_panjang_tweet].user.profile_image_url_https ;
    	var tmp_tanggal = '0';
    	//console.log(tmp_user_id + ' ' + tmp_name + tmp_screen_name + tmp_location + tmp_following + tmp_follow_request_sent + tmp_protected + tmp_profile_image_url_https );
        
            var KoneksiStatusFollowerBot = mysql.createConnection({
            host     : dbhost,    
            port     : dbport,
            user     : dbuser,
            password : dbpassword,
            database : dbdatabase, 
            insecureAuth: true
            });
                   
            KoneksiStatusFollowerBot.connect();  
            KoneksiStatusFollowerBot.query('INSERT INTO status_follow_bot(user_id, name, screen_name, location, following, followback, follow_request_sent, muting, blocking, blocked_by, protected, profile_image_url_https, tanggal ) VALUES( '+mysql.escape(tmp_user_id)+', '+mysql.escape(tmp_name)+', '+mysql.escape(tmp_screen_name)+', '+mysql.escape(tmp_location)+', '+mysql.escape(tmp_following)+', '+mysql.escape(tmp_followback)+', '+mysql.escape(tmp_follow_request_sent)+', '+mysql.escape(tmp_muting)+', '+mysql.escape(tmp_blocking)+', '+mysql.escape(tmp_blocked_by)+', '+mysql.escape(tmp_protected)+', '+mysql.escape(tmp_profile_image_url_https)+', '+mysql.escape(tmp_tanggal)+' )', function(err, result) {
              if (err) {
                  console.log('mysql err = ' + err);
                  //--- reset
                  global_nomor_urut = 0;
                  global_cari_teman_konter = 0;
                  angka_triger_cari_teman = 0; //reset konter utama
                  //---
                } else {
                  console.log('insert data ke '+ ' selesai');
                  callback(null, arg1);
                }
            }); 
            KoneksiStatusFollowerBot.end(); 
		
    },
    function(arg1, callback) {
      /*
    	    var tmp_screen_name = arg1.statuses[global_panjang_tweet].user.screen_name ;
    	    var tmp_profile_image_url_https = arg1.statuses[global_panjang_tweet].user.profile_image_url_https ;
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
            	callback(null, arg1);
            } else {
              download(alamat_profil, './public/foto_profil/'+tmp_screen_name+'/'+tmp_screen_name+'.jpg', function(){
                console.log('done');
                callback(null, arg1);
              });
            }
            });
       */
      callback(null, arg1);
        
    },
    function(arg1, callback) {
          var tmp_user_id = arg1.statuses[global_panjang_tweet].user.id ;
          var tmp_name = arg1.statuses[global_panjang_tweet].user.name ;
          var tmp_screen_name = arg1.statuses[global_panjang_tweet].user.screen_name ;
          var tmp_location = arg1.statuses[global_panjang_tweet].user.location ;
          var tmp_description = arg1.statuses[global_panjang_tweet].user.description ;
          var tmp_url = arg1.statuses[global_panjang_tweet].user.url ;
          var tmp_protected = arg1.statuses[global_panjang_tweet].user.protected ;
          var tmp_followers_count = arg1.statuses[global_panjang_tweet].user.followers_count ;
          var tmp_friends_count = arg1.statuses[global_panjang_tweet].user.friends_count ;
          var tmp_profile_image_url_https = arg1.statuses[global_panjang_tweet].user.profile_image_url_https ;
          var alamat_profil = S(tmp_profile_image_url_https).replaceAll('_normal', '').s;
          
          var buf = fs.readFileSync('./public/poto_profil.json', "utf8");
          var pangjangbuf = JSON.parse(buf);
          console.log('panjang bufer ' + pangjangbuf.length);
          var json2 = [
                         {
                          "id": pangjangbuf.length + 1 ,
                          "user_id": tmp_user_id,
                          "name": tmp_name,
                          "screen_name": tmp_screen_name,
                          "location": tmp_location,
                          "desciption": tmp_description,
                          "url": tmp_url,
                          "protected": tmp_protected,
                          "followers_count": tmp_followers_count,
                          "friends_count": tmp_friends_count,
                          "alamat_profil": alamat_profil
                         }
                       ]
           cmdBotSimpanJSON.BotSimpanJSON( json2 , function(hasilnya){
                  //console.log(hasilnya);
                  //var mergeData = merge.recursive(true, arg1, hasilnya ) ;
                  //console.log('merge ' + stringify(mergeData, null, 2));
                  callback(null, hasilnya);
           });   
    },
    function(arg1, callback) {
      /*
    var tmp_profile_image_url_https = arg1.statuses[global_panjang_tweet].user.profile_image_url_https ;
		var alamat_profil = S(tmp_profile_image_url_https).replaceAll('_normal', '').s;

           cmdBotCekWajah.BotCekWajah( alamat_profil , function(hasilnya){
                  console.log(hasilnya);
                  //var mergeData = merge.recursive(true, arg1, hasilnya ) ;
                  //console.log('merge ' + stringify(mergeData, null, 2));
                  callback(null, hasilnya);
           });
      */
       callback(null, 'ok');
		
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
    console.log('error = ' + err);
    console.log('hasil = ' + result);
    //--- reset
    angka_triger_cari_teman = 0; //reset konter utama
    //---
});

}


var angka_triger_cari_teman = 0;
exports.StartCariTeman = function DataUpload(callback){
setInterval(function() {
++angka_triger_cari_teman;  
	if (angka_triger_cari_teman === 15){
   		utama_cari_teman();
	}

var data_bufer = [
              {
              "id_kunci": global_nomor_urut,  
              "kata_kunci": global_socket_kata_kunci ,
              "jumlah_kata_kunci": global_panjang_kata_kunci[0],
              "ambil_acak": global_panjang_kata_kunci[1],
              "screen_name": global_socket_mencari_kalimat[0],
              "teks": global_socket_mencari_kalimat[1],
              "rutin_break": global_socket_informasi_interrupt[0],
              "status": global_socket_informasi_interrupt[1],
              "timer_utama": global_konter_publik_search,
              "timer_internal": global_nomor_urut
              }
            ]
 callback(data_bufer);

 // callback(angka_triger_cari_teman);
}, 1000);

}