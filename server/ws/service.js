const http = require('http');
const io = require('socket.io');

const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('<p>Hello Socket.IO!<p>')
}); 