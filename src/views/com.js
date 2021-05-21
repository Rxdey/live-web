import { onMounted, ref, watch } from '@vue/runtime-dom';
import io from 'socket.io-client';

export const liveStart = (modelValue, emit) => {
  let socket = null;
  let pc = null;
  // 创建链接
  const createConnect = () => {
    socket = io('http://localhost:3000');
    socket.on('receiveMsg', data => {
      console.log('普通消息', data);
    });
    this.socket.on('message', data => {
      const { msg } = data;
      if (!pc) return;
      if (msg.type === 'candidate') {
        const candidate = new RTCIceCandidate({
          sdpMLineIndex: msg.label,
          candidate: msg.candidate
        });
        pc.addIceCandidate(candidate);
      }
      if (msg.type === 'offer') {
        pc.setRemoteDescription(new RTCSessionDescription(msg));
        pc.createAnswer().then(
          this.setLocalAndSendMessage,
          error => { console.log(error); }
        );
      }
      if (msg.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(msg));
      }
      if (msg.type === 'bye') {
        console.log('房主已离开');
        pc.close();
        pc = null;
      }
    });
  };
  //
  const setLocalAndSendMessage = (sessionDescription) => {
    if (!pc) return;
    pc.setLocalDescription(sessionDescription);
    this.sendMessage(sessionDescription);
  };
  const sendMessage = (message) => {
    const msg = { msg: message, roomName: 'rxdey', client: '' };
    this.socket.emit('message', msg);
  };
  return {

  };
};

export default {
  liveStart
};
