var stringify = require('json-stringify-safe');

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var app = express(); 
var server = http.createServer(app);
var io = require('socket.io')(server);

var cluster = require('cluster');
if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}
if (cluster.isWorker) {

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
      res.sendfile('public/index.html');
      //res.send(global_data_socket);
});

var cmdCariTeman = require('./twitter_cari_teman.js');
var cmdFollower = require('./twitter_follower.js');
var cmdFollowback = require('./twitter_followback.js');
var cmdUnfollow = require('./twitter_unfollow.js');
var cmdPublicSearch = require('./twitter_public_search.js');
/*
var data_CariTeman = [];
cmdCariTeman.StartCariTeman(function(hasil){
   console.log('depan: ' + hasil);
   data_CariTeman = stringify(hasil, null, 2);
});

var data_Follower = [];
cmdFollower.StartFollower(function(hasil){
    //console.log('depan: ' + hasil);
    data_Follower = stringify(hasil, null, 2);
});

var data_Followback = [];
cmdFollowback.StartFollowback(function(hasil){
    //console.log('depan: ' + hasil);
    data_Followback = stringify(hasil, null, 2);
});

var data_Unfollow = [];
cmdUnfollow.StartUnfollow(function(hasil){
    //console.log('depan: ' + hasil);
    data_Unfollow = stringify(hasil, null, 2);
});
*/
var data_PublicSearch = [];
cmdPublicSearch.StartPublicSearch(function(hasil){
   //console.log('depan: ' + stringify(hasil, null, 2) );
   data_PublicSearch = stringify(hasil, null, 2);
});


io.on('connection', function (socket) {

  setInterval(function(){ 
  	var parsePublicSearch = JSON.parse(data_PublicSearch);
  	//console.log('socket: ' + parsePublicSearch[0].kata_kunci );
     socket.emit('informasi_mencari_kalimat', { id_kunci: parsePublicSearch[0].id_kunci, kata_kunci: parsePublicSearch[0].kata_kunci, jumlah_kata_kunci: parsePublicSearch[0].jumlah_kata_kunci, ambil_acak: parsePublicSearch[0].ambil_acak, screen_name: parsePublicSearch[0].screen_name, teks: parsePublicSearch[0].teks } );
     socket.emit('informasi_interrupt', { rutin_break: parsePublicSearch[0].rutin_break, status: parsePublicSearch[0].status } );
     socket.emit('informasi_timer', { timer_utama: parsePublicSearch[0].timer_utama, timer_internal: parsePublicSearch[0].timer_internal } );
    // socket.emit('informasi_mencari_teman', { timer_internal: global_hitung_waktu,  nomer_kata_kunci: global_nomor_urut } );
    
  }, 1000);
    
});


var server_ipaddr = process.env.DOMAIN || '';
var server_port = process.env.PORT || 5001;
server.listen(server_port, function() {
  console.log("Listening on " + server_port);
});

}