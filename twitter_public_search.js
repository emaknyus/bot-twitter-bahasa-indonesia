"use strict";
var Twitter = require('twitter');
var KalimatDariTwitter = require('strsplit');
var trim = require('trim-character');
var S = require('string');
var wf = require('word-freq');
var nomor_acak = require("random-js")();
var mysql = require('mysql');
var async = require('async');
var colors = require('colors');
var safeParse = require("safe-json-parse/callback");
var stringify = require('json-stringify-safe');
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

//---------------------------------------------------------------------------------------------------
//-------------
var global_socket_data = [];
var global_socket_informasi_interrupt = [];
var global_socket_mencari_kalimat = [];
var global_socket_kata_kunci = "";
var global_panjang_kata_kunci = [];
//-------------

var ID_kunci = 1;
var global_public_search_konter = ID_kunci;
var global_nomor_urut = ID_kunci;  

function publik_search(){

var jumlah_text = 90;
var lokal_screen_name = [];
var lokal_tweet_text = [];

var global_panjang_text = 0;
var global_tweets;

var kata_kunci_twitter = [];

async.waterfall([
    function(callback) {
        global_socket_mencari_kalimat[0] = "" ;
        global_socket_mencari_kalimat[1] = "" ;       
        global_socket_informasi_interrupt[0] = "";
        global_socket_informasi_interrupt[1] = ""; 
        global_socket_informasi_interrupt[2] = ""; 
        global_panjang_kata_kunci[0] = ""; 
        global_panjang_kata_kunci[1] = "";  
        global_socket_data[0] = "";
        global_socket_data[1] = "";
        callback(null, 'nol');
    },
    function(arg1, callback) {
      // arg1 now equals 'one' and arg2 now equals 'two'
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
              //-- reset
              global_nomor_urut = 0;
              global_public_search_konter = 0;
              angka_triger_publik_search = 0; //reset konter publik_search
              //-- reset
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
        //function fungsi_mulai(){
                   
           ++global_public_search_konter;
           
           if (global_public_search_konter >= 0 && global_public_search_konter <= kata_kunci_twitter.length-1){
              ++global_nomor_urut;  

              callback(null, global_nomor_urut);
           } else {
                  console.log('rutin_break: data habis'.red);

                  global_socket_informasi_interrupt[0] = "query database telah selesai";
                  global_socket_informasi_interrupt[1] = "restart looping";
                  //-- reset
                  angka_triger_publik_search = 0; //reset konter publik_search
                  //-- reset
                  
           }
              console.log('timer internal : ' + global_public_search_konter + ' nomor urut ' + global_nomor_urut);
              
           
    },
    function(arg1, callback) {
      var angka = Number(arg1);

      global_socket_kata_kunci = kata_kunci_twitter[angka].definisi ;

        console.log('kata kunci pencarian : ' + kata_kunci_twitter[angka].definisi);      
        client.get('search/tweets', {q: '"'+kata_kunci_twitter[angka].definisi+'"', lang: 'in', result_type: 'mixed', count: jumlah_text}, function(err, tweets, response){
            //https://dev.twitter.com/rest/public/search 
            //https://dev.twitter.com/rest/reference/get/search/tweets
            if (err) {
                  console.log('search/tweets ' + err);
                  console.log('rutin_break: melebihi batas query twitter'.red);
                  //-- reset
                  global_nomor_urut = 0;
                  global_public_search_konter = 0;
                  angka_triger_publik_search = 0; //reset konter publik_search
                  //-- reset

            } else {    
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
            global_tweets = arg1;

            global_panjang_kata_kunci[0] = global_tweets.statuses.length;

        if (Math.round(global_panjang_kata_kunci[0]) > 1) {
           
            callback(null, global_panjang_kata_kunci[0]);
        } else {
            callback(null, global_panjang_kata_kunci[0]);
        }
        
    },
    function(arg1, callback) {

            var tmp_nilai_acak = nomor_acak.integer(0, (Math.round(Number(arg1))-1)) ;
            //----
            global_panjang_kata_kunci[1] = tmp_nilai_acak;
            global_socket_mencari_kalimat[0] = global_tweets.statuses[tmp_nilai_acak].user.screen_name ;
            global_socket_mencari_kalimat[1] = global_tweets.statuses[tmp_nilai_acak].text ;
            //-----


            if (tmp_nilai_acak > 1){ 
            //console.log('panjang text: ' + global_tweets.statuses.length + ' | nilai acak text: ' + tmp_nilai_acak);

            var setripKarakter = '. ' + global_tweets.statuses[tmp_nilai_acak].text;
            var jumlah_ffk = S(setripKarakter).count('@');

              if (jumlah_ffk === 0){  
                 if (setripKarakter.length > 10 && (global_tweets.statuses[tmp_nilai_acak].user.screen_name.length + setripKarakter.length) <= 138 ){
                   //cb
                     console.log(global_tweets.statuses[tmp_nilai_acak].text);  // The favorites. 
                     console.log(global_tweets.statuses[tmp_nilai_acak].user.screen_name);  // The favorites.                   
                     callback(null, [setripKarakter, tmp_nilai_acak]);
                 } else {
                     console.log('rutin_break: karakter terlalu panjang'.red);
                     
                     global_socket_informasi_interrupt[0] = "karakter terlalu panjang";
                     global_socket_informasi_interrupt[1] = "restart looping";  
                     //-- reset
                     angka_triger_publik_search = 0; //reset konter publik_search
                     //-- reset          

                 }
              } else {
                     console.log('rutin_break: terlalu banyak mention @'.red);
 
                     global_socket_informasi_interrupt[0] = "terlalu banyak mention @";
                     global_socket_informasi_interrupt[1] = "restart looping"; 
                     //-- reset
                     angka_triger_publik_search = 0; //reset konter publik_search
                     //-- reset       
              }
            } else {
                     console.log('rutin_break: hasil query twitter nihil'.red);
 
                     global_socket_informasi_interrupt[0] = "hasil query twitter nihil";
                     global_socket_informasi_interrupt[1] = "restart looping";   
                     //-- reset
                     angka_triger_publik_search = 0; //reset konter publik_search
                     //-- reset        
            }
        
    },
    function(arg1, callback) {
     // console.log('coeg: ' + arg1[0]);
     // console.log('coeg: ' + arg1[1]);

        var tmp_ffk = fungsi_filter_kata(arg1[0]);

                if ( tmp_ffk === true ){
                    // console.log('sepam kak');
                    
                     console.log('rutin_break: ada spam'.red);
 
                     global_socket_informasi_interrupt[0] = "teks mengandung spam";
                     global_socket_informasi_interrupt[1] = "restart looping" ;
                     //-- reset
                     angka_triger_publik_search = 0; //reset konter publik_search
                     //-- reset   
                     
                } 
                if ( tmp_ffk === false ){
                     
                     //console.log('hasil filter ' + tmp_ffk);
                     
                     lokal_screen_name = global_tweets.statuses[arg1[1]].user.screen_name;
                     
                     var tmp_st = global_tweets.statuses[arg1[1]].text;
                     var StatusTwitter = tmp_st.replace(/[^a-zA-Z]/gi,' ');
                     var ganti_huruf_kecil = S(StatusTwitter).capitalize().s; 
                     var trim_status_twitter = S(ganti_huruf_kecil).collapseWhitespace().s; 
                     
                     lokal_tweet_text = trim_status_twitter;
                   
                     callback(null, [lokal_screen_name, lokal_tweet_text]);
                }
                     
              
    },
    function(arg1, callback) {
     // console.log('jembut ' + arg1[1]);
//########################################################################### CEK APAKAH SUDAH ADA DALAM DATA
//function fungsi_cek_data_masuk(tsn, tpmf)

var KoneksiStatusPublicStream = mysql.createConnection({
  host     : dbhost,    
  port     : dbport,
  user     : dbuser,
  password : dbpassword,
  database : dbdatabase, 
  insecureAuth: true
});

KoneksiStatusPublicStream.connect();
KoneksiStatusPublicStream.query('SELECT * FROM status_public_stream WHERE text='+mysql.escape(arg1[1])+' ', function(err, HasilQueryText) {
  if (err) {
      console.log('mysql ' + err);     
      //-- reset
      global_nomor_urut = 0;
      global_public_search_konter = 0;
      angka_triger_publik_search = 0; //reset konter publik_search
      //-- reset
  } else {      
         console.log(HasilQueryText);
         if (HasilQueryText.length < 1){
             console.log('kosong kak');
             //panggil fungsi masukkan data
             global_socket_informasi_interrupt[0] = "kalimat belum masuk database" ;
             global_socket_informasi_interrupt[1] = "lanjut rutin berikutnya" ;
             
             callback(null, [arg1[0], arg1[1]]);
         } else {
            console.log('rutin_break: sudah ada kak'.red);
            global_socket_informasi_interrupt[0] = "kalimat sudah masuk database" ;
            global_socket_informasi_interrupt[1] = "restart looping" ;
            //-- reset
            angka_triger_publik_search = 0; //reset konter publik_search
            //-- reset
    }    
  }
});
KoneksiStatusPublicStream.end();   
    },
    function(arg1, callback) {
//########################################################################### MASUKKAN DATA
//function fungsi_kirim_data(){

var KoneksiKirimData = mysql.createConnection({
  host     : dbhost,    
  port     : dbport,
  user     : dbuser,
  password : dbpassword, 
  database : dbdatabase, 
  insecureAuth: true
});
KoneksiKirimData.connect();
KoneksiKirimData.query('INSERT INTO status_public_stream(namescreen, text) VALUES( '+ mysql.escape(arg1[0]) +', '+ mysql.escape(arg1[1]) +' )', function(err, result) {
        if (err) {
            console.log('mysql ' + err);
            //-- reset
            global_nomor_urut = 0;
            global_public_search_konter = 0;
            angka_triger_publik_search = 0; //reset konter publik_search
            //-- reset
        } else {  
        	     global_socket_informasi_interrupt[0] = "kalimat telah dimasukkan kedalam database" ;
               global_socket_informasi_interrupt[1] = "lanjut rutin berikutnya" ;
               callback(null, 'done');    
        } 
}); 
KoneksiKirimData.end();

        
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    } 
], function (err, result) {
    // result now equals 'done'
    //-- reset
    //global_nomor_urut = 0;
    //global_public_search_konter = 0;
    angka_triger_publik_search = 0; //reset konter publik_search
    //-- reset
});
}

//########################################################################### 
// FUNGSI FILTER KATA
function fungsi_filter_kata(KataMasuk){
  var lokal_kata = []; 
    lokal_kata[0] = S(KataMasuk).contains('follow');
    lokal_kata[1] = S(KataMasuk).contains('kontol');
    lokal_kata[2] = S(KataMasuk).contains('https');
    lokal_kata[3] = S(KataMasuk).contains('www');
    lokal_kata[4] = S(KataMasuk).contains('invite');
    lokal_kata[5] = S(KataMasuk).contains('http');
    lokal_kata[6] = S(KataMasuk).contains('pin');   
    lokal_kata[7] = S(KataMasuk).contains('Http'); 
    lokal_kata[8] = S(KataMasuk).contains('Follow'); 
    lokal_kata[9] = S(KataMasuk).contains('#KamusGaul'); 
    lokal_kata[10] = S(KataMasuk).contains('#BahasaGaul'); 
    lokal_kata[11] = S(KataMasuk).contains('bot_geje'); 
    lokal_kata[12] = S(KataMasuk).contains('kontol'); 
    lokal_kata[13] = S(KataMasuk).contains('kontol'); 
    lokal_kata[14] = S(KataMasuk).contains('^');  
    lokal_kata[15] = S(KataMasuk).contains('*');
    lokal_kata[16] = S(KataMasuk).contains('(');
    lokal_kata[17] = S(KataMasuk).contains(')');
    lokal_kata[18] = S(KataMasuk).contains('#');
    lokal_kata[19] = S(KataMasuk).contains('+');
    lokal_kata[20] = S(KataMasuk).contains('=');

    for (var i = 0; i < lokal_kata.length ; i++){
        if (lokal_kata[i] === true){
          KataMasuk = true;
        } 
       if (KataMasuk !== true){
          KataMasuk = false;
       }
    }

  return KataMasuk;
}  


//###########################################################################


var angka_triger_publik_search = 0;
exports.StartPublicSearch = function DataUpload(callback){

setInterval(function() {
++angka_triger_publik_search;  
  if (angka_triger_publik_search === 60){
      publik_search();
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
              "timer_utama": angka_triger_publik_search,
              "timer_internal": global_nomor_urut
              }
            ]
 callback(data_bufer);
}, 1000);

}
