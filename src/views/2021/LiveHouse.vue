<template>
  <div class="LiveHouse">
    <p>本地</p>
    <div class="video-wapper">
      <video class="video" autoplay playsinline ref="video"></video>
      <button class="button" @click="handleJoin">加入</button>
      <button class="button" @click="handleStart">开始</button>
      <button class="button" @click="closeLive">离开</button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

const roomName = 'rxdey';
const iceServers = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' }
  ]
};
export default {
  name: 'LiveHouse',
  components: {
  },
  data() {
    return {
      socket: null,
      offerOption: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0
      },
      localstream: null,
      localPeer: null
    };
  },
  mounted() {
    this.createConnect();
  },
  methods: {
    async handleStart() {
      const localstream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const video = this.$refs.video;
      video.srcObject = localstream;
      this.localPeer = this.createPeer();
      // 监测到可用网络候选者
      this.localPeer.onicecandidate = (event) => {
        if (!event.candidate) return;
        this.sendMessage({
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      };
      this.localPeer.onaddstream = () => {

      };
      this.localPeer.addStream(localstream);

      this.localPeer.createOffer(sessionDescription => {
        this.localPeer.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message');
        this.sendMessage(sessionDescription);
      }, error => {
        console.log(error);
      });
    },
    // 创建 RtcPeerConnection
    createPeer() {
      const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
      return new PeerConnection(null);
    },
    // 连接服务器
    createConnect() {
      this.socket = io('http://localhost:3000');
      this.socket.on('receiveMsg', data => {
        console.log('普通消息', data);
      });
      this.socket.on('message', data => {
        const { msg } = data;
        console.log('服务连接:', msg);
        if (msg.type === 'candidate') {
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: msg.label,
            candidate: msg.candidate
          });
          this.localPeer.addIceCandidate(candidate);
        }
        if (msg.type === 'offer') {
          this.localPeer.setRemoteDescription(new RTCSessionDescription(msg));
          this.localPeer.createAnswer().then(
            this.setLocalAndSendMessage,
            error => { console.log(error); }
          );
        }
        if (msg.type === 'answer') {
          this.localPeer.setRemoteDescription(new RTCSessionDescription(msg));
        }
        if (msg.type === 'bye') {
          this.localPeer.close();
          this.localPeer = null;
        }
      });
    },
    // 加入房间
    handleJoin() {
      this.socket.emit('joinRoom', { roomName }, (data) => {
        console.log(`加入房间：${JSON.stringify(data)}`);
      });
    },
    sendMessage(message) {
      const msg = { msg: message, roomName: 'rxdey', client: '主播' };
      this.socket.emit('message', msg);
    },
    closeLive() {
      this.sendMessage({ type: 'bye' });
      this.localPeer.close();
      this.localPeer = null;
    }
  },
  beforeDestroy() {
    this.closeLive();
  },
  watch: {
  },
  computed: {
  }
};
</script>

<style lang="less">
.video-wapper {
  background: #000;
  width: 300px;
  height: 200px;
  margin: 0 auto;
  video {
    width: 100%;
    height: 100%;
    margin-bottom: 10px;
  }
}
</style>
