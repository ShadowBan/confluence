var express = require('express');
var app = express();
var partials = require('express-partials');
var fs = require('fs');

app.engine('hamlc', require('haml-coffee').__express);
app.use(partials());
app.use(express.logger());

app.configure(function() {
  app.set('view engine', 'hamlc');
  app.set('layout', 'layout');
})

app.get('/', function(req, res) {
  res.render('index', { name: 'Express user' });
})

var port = process.env.PORT || 5000;
var server = require('http').createServer(app).listen(port);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(client){
  client.on('join',function(name){
    client.set('nickname',name)
  });

  client.on("message",function (data){
    client.get('nickname',function(err,name){
      var message = "<li class='chat-line'><span class='name'>"+name+"</span><span class='message'>"+data+"</span></li>";
      client.broadcast.emit("messages", message);
    });
  });
});

console.log('App started on port '+port);
