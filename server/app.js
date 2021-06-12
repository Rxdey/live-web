const app = require('express')();
const bodyParser = require('body-parser');
const colors = require('colors');
const http = require('http').Server(app);
const path = require('path');
const socketIo = require('socket.io')(http, { cors: true });

app.use((req, res, next) => {
  if (req.path !== '/' && !req.path.includes('.')) {
    res.header({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-Requested-With',
      'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8'
    });
  }
  next();
});

socketIo.on('connection', (clientSocket) => {
  clientSocket.on('joinRoom', (data, fn = () => { }) => {
    clientSocket.join(data.roomName); // join(房间名)加入房间
    fn({ code: 0, msg: '加入房间成功', roomName: data.roomName, socketId: clientSocket.id });
  });

  clientSocket.on('leaveRoom', (data, fn = () => { }) => {
    clientSocket.broadcast.to(data.roomName).emit('message', { ...data, msg: { type: 'bye' } });
    clientSocket.leave(data.roomName); // leave(房间名) 离开房间
    fn({ code: 0, msg: '已退出房间', roomName: data.roomName });
  });

  clientSocket.on('sendMsg', (data, fn = () => { }) => {
    // 使用 emit 发送消息，broadcast 表示 除自己以外的所有已连接的socket客户端。
    // to(房间名)表示给除自己以外的同一房间内的socket用户推送消息
    clientSocket.broadcast.to(data.roomName).emit('receiveMsg', { ...data, socketId: clientSocket.id });
    fn({ code: 0, msg: '消息发生成功' });
  });
  clientSocket.on('close', (data, fn = () => { }) => {
    clientSocket.broadcast.to(data.roomName).emit('close', { socketId: clientSocket.id });
    fn({ code: 0, msg: '消息发生成功' });
  });

  clientSocket.on('message', (data, fn = () => { }) => {
    const { socketId } = data;
    if (socketId) {
      clientSocket.to(socketId).emit('message', { ...data, socketId: clientSocket.id });
    } else {
      clientSocket.broadcast.to(data.roomName).emit('message', { ...data, socketId: clientSocket.id });
    }
    fn({ code: 0, msg: '消息发生成功' });
  });
});

const port = 3999;
http.listen(port, () => {
  console.log(`server running @ http://localhost:${port}`);
});
