import { onMounted, watch, reactive, toRefs } from '@vue/runtime-dom';
import { io } from 'socket.io-client';

// 响应
const createConnect = (socket, peer, isLiver, cb = () => { }) => {
  socket.on('message', data => {
    const { msg, userType } = data;
    console.log('服务连接:', msg.type);
    if (msg.type === 'candidate') {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: msg.label,
        candidate: msg.candidate
      });
      peer.addIceCandidate(candidate);
    }
    if (msg.type === 'offer') {
      peer.setRemoteDescription(new RTCSessionDescription(msg));
      peer.createAnswer().then(
        sessionDescription => {
          peer.setLocalDescription(sessionDescription);
          console.log('setLocalAndSendMessage sending message');
          cb(sessionDescription);
        },
        error => { console.log(error); }
      );
    }
    if (msg.type === 'answer') {
      if (isLiver) {
        peer.setRemoteDescription(new RTCSessionDescription(msg));
      }
    }
    if (msg.type === 'bye') {
      peer.close();
      peer = null;
    }
  });
  return socket;
};

export const useLiveStart = (currentDetail, isLiver = false) => {
  // const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  const peer = new RTCPeerConnection(null);
  // const socket = io();
  const socket = io('http://127.0.0.1:3000');
  // 发送消息
  const sendMessage = (sc, message) => {
    const msg = { msg: message, ...currentDetail };
    sc.emit('message', msg);
  };
  createConnect(socket, peer, isLiver, (sessionDescription) => {
    sendMessage(socket, sessionDescription);
  });
  return {
    socket,
    peer,
    sendMessage
  };
};

export default useLiveStart;
