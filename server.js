var express = require('express');
var partials = require('express-partials');
var app = express();

app.engine('hamlc', require('haml-coffee').__express);
app.use(partials());

app.configure(function() {
  app.set('view engine', 'hamlc');
  app.set('layout', 'layout');
})

app.get('/', function(req, res) {
  res.render('index', { name: 'Express user' });
})

app.listen(3000);
console.log('App started on port 3000');
