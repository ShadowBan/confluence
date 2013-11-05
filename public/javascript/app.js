$(function() {
  var nickname = '';
  var socket = io.connect('http://192.168.1.17:5000/');
  //var socket = io.connect('http://confluencechat.herokuapp.com');
  $('#chat_form').submit(function(e){
    e.preventDefault();
    var message = $('#chat_input').val();
    socket.emit('message',message);
    $('#chat').append("<li class='chat-line'><span class='name'>"+nickname+": </span><span class='message'>"+message+"</span></li>");
    $('#chat_form input').val('');
  });

  socket.on('connect', function(data){
    nickname = prompt("What should I call you?");
    socket.emit('join',nickname);
    $('#chat_form').show();
    $('#loading').hide();
  });

  socket.on('messages', function(data){$('#chat').append(data);});
});