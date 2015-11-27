'use strict';

var express = require('express');
var app = express();
var scale = require('..');

app.use('/scale', scale({baseHost: 'lorempixel.com'}));

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('✔ Example app listening at http://%s:%s', host, port);
});
