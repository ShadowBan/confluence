var http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , partials = require('express-partials')


app.engine('hamlc', require('haml-coffee').__express);

app.use(partials());

app.configure(function() {
  app.set('view engine', 'hamlc');
  app.set('layout', 'layout');
})

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app).listen(port);
var io = require('socket.io').listen(server);

console.log('http server listening on %d', port);

app.get('/', function(req, res) {
  res.render('index', { name: 'Express user' });
})

io.sockets.on('connection', function (socket) {
  console.log('websocket connection open');

  socket.on('join',function(name){
    socket.set('nickname',name)
  });

  socket.on("message",function (data){
    socket.get('nickname',function(err,name){
      var message = "<li class='chat-line'><span class='name'>"+name+": </span><span class='message'>"+data+"</span></li>";
      socket.broadcast.emit("messages", message);
    });
  });

  socket.on('disconnect', function() {
    console.log('websocket connection close');
  });
});














