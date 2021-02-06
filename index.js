var path = require('path')
var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('images'))
// app.use(express.static('js'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
