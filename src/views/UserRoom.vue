<template>
  <div class="UserRoom">
    <video id="video"></video>
    <button @click="handleJoin">开始</button>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { reactive, ref, toRefs, onMounted, computed } from '@vue/runtime-dom';

export default {
  name: 'UserRoom',
  components: {
  },
  setup(props, context) {
    const data = reactive({
      remotePeer: null,
      socket: null
    });
    const createPeer = () => {
      const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      this.remotePeer = new PeerConnection(null);
      this.remotePeer = new RTCPeerConnection(null);
      this.remotePeer.onicecandidate = () => {

      };
      this.remotePeer.onaddstream = (obj) => {
        const video = document.querySelector('#video');
        video.srcObject = obj.stream;
      };
    };
    const setLocalAndSendMessage = (sessionDescription) => {
      this.remotePeer.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.sendMessage(sessionDescription);
    };
    const createConnect = () => {
      this.socket = io('http://localhost:3000');
      this.socket.on('receiveMsg', msg => {
        console.log('普通消息', msg);
      });
      this.socket.on('message', message => {
        const { msg } = message;
        if (msg.type === 'candidate') {
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: msg.label,
            candidate: msg.candidate
          });
          this.remotePeer.addIceCandidate(candidate);
        }
        if (msg.type === 'offer') {
          this.remotePeer.setRemoteDescription(new RTCSessionDescription(msg));
          this.remotePeer.createAnswer().then(
            setLocalAndSendMessage,
            error => { console.log(error); }
          );
        }
        if (msg.type === 'answer') {
          this.remotePeer.setRemoteDescription(new RTCSessionDescription(msg));
        }
        if (msg.type === 'bye') {
          console.log('房主已离开');
          this.remotePeer.close();
          this.remotePeer = null;
        }
      });
    };

    const sendMessage = (message) => {
      const msg = { msg: message, roomName: 'rxdey', client: '主播' };
      this.socket.emit('message', msg);
    };
    // 加入房间
    const handleJoin = () => {
      this.socket.emit('joinRoom', { roomName: 'rxdey' }, message => {
        console.log(`加入房间：${JSON.stringify(message)}`);
        const msg = { msg: '洞洞加入Room', roomName: message.roomName, client: '洞洞' };
        this.socket.emit('sendMsg', msg);
      });
    };
    onMounted(() => {
      createConnect();
      createPeer();
    });
    return {
      ...toRefs(data),
      sendMessage
    };
  }
};
</script>

<style lang="less">
</style>
