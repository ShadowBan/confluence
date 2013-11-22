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

app.get('/messages', function(req,res){
  res.json([{body: 'hello'},{body: 'world'}]);
});

app.get('/', function(req, res) {
  res.render('index', { name: 'Express user' });
})

io.sockets.on('connection', function (socket) {
  console.log('websocket connection open');

  var name = userNames.getGuestName();
  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('message:send', function (data) {
    socket.broadcast.emit('message:send', {
      user: name,
      text: data.message
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('user:name:change', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('user:name:change', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });
});


var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || userNames[name]) {
      return false;
    } else {
      userNames[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in userNames) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (userNames[name]) {
      delete userNames[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());












