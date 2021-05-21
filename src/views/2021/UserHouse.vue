<template>
  <div class="LiveHouse">
    <p>观众</p>
    <div class="video-wapper">
      <video class="video" autoplay playsinline ref="video"></video>
      <button class="button" @click="handleJoin">加入</button>
      <button class="button" @click="handleStart">开始</button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

const iceServers = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' }
  ]
};

export default {
  name: 'UserHouse',
  components: {
  },
  data() {
    return {
      remotePeer: null,
      socket: null
    };
  },
  mounted() {
    this.createConnect();
    this.createPeer();
  },
  methods: {
    handleStart() {
    },
    // 创建 RtcPeerConnection
    createPeer() {
      const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      this.remotePeer = new PeerConnection(null);
      this.remotePeer = new RTCPeerConnection(null);
      this.remotePeer.onicecandidate = () => {

      };
      this.remotePeer.onaddstream = (obj) => {
        const video = this.$refs.video;
        video.srcObject = obj.stream;
      };
    },
    // 连接服务器
    createConnect() {
      this.socket = io('http://localhost:3000');
      this.socket.on('receiveMsg', data => {
        console.log('普通消息', data);
      });

      this.socket.on('message', data => {
        const { msg } = data;
        console.log('Client received message:', msg);
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
            this.setLocalAndSendMessage,
            error => { console.log(error); }
          );
        }
        if (msg.type === 'answer') {
          this.remotePeer.setRemoteDescription(new RTCSessionDescription(msg));
        }
        console.log(data);
        if (msg.type === 'bye') {
          console.log('房主已离开');
          this.remotePeer.close();
          this.remotePeer = null;
        }
      });
    },
    setLocalAndSendMessage(sessionDescription) {
      this.remotePeer.setLocalDescription(sessionDescription);
      console.log('setLocalAndSendMessage sending message', sessionDescription);
      this.sendMessage(sessionDescription);
    },
    // 加入房间
    handleJoin() {
      this.socket.emit('joinRoom', { roomName: 'rxdey' }, (data) => {
        console.log(`加入房间：${JSON.stringify(data)}`);
        const msg = { msg: '洞洞加入Room', roomName: data.roomName, client: '洞洞' };
        this.socket.emit('sendMsg', msg);
      });
    },
    sendMessage(message) {
      const msg = { msg: message, roomName: 'rxdey', client: '主播' };
      this.socket.emit('message', msg);
    }
  },
  watch: {
  },
  computed: {
  }
};
</script>

<style lang="less">
</style>
