<template>
  <div class="live-room">
    <div class="video-wrap">
      <video id="video" autoplay playsinline controls="controls"></video>
    </div>
    <div class="button-wrap">
      <el-button type="danger" @click="handleJoin">开始</el-button>
      <el-button @click="handleStop">停止</el-button>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from '@vue/runtime-dom';
import { io } from 'socket.io-client';

export default {
  name: 'LiveRoom',
  components: {
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      userDetail: {
        roomName: 'rxdey',
        client: 'Up',
        userType: 1,
        userId: 1
      },
      peerList: [],
      localStream: null,
      socket: null,
      peer: null
    });
    const sendMessage = (message, socketId = null) => {
      const msg = { msg: message, ...state.userDetail, socketId };
      state.socket.emit('message', msg);
    };
    const createOffer = (peer, socketId = null) => {
      peer.createOffer(sessionDescription => {
        peer.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription, socketId);
      }, error => {
        console.log(error);
      });
    };
    const createPeer = (stream, data) => {
      const peer = new RTCPeerConnection(null);
      peer.onicecandidate = (event) => {
        if (!event.candidate) return;
        sendMessage({
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        }, data.socketId);
      };
      if (stream) {
        peer.addStream(stream);
        createOffer(peer, data.socketId);
      }
      return peer;
    };
    const handleJoin = async () => {
      const video = document.querySelector('#video');
      const localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      video.srcObject = localStream;
      state.localStream = localStream;
      state.peerList.map(item => {
        item.peer.addStream(localStream);
        createOffer(item.peer);
      });
    };
    const handleStop = () => { };
    onMounted(() => {
      state.socket = io();
      state.socket.emit('joinRoom', state.userDetail, (data) => {
        console.log(`up加入房间：${JSON.stringify(data)}`);
      });
      state.socket.on('receiveMsg', data => {
        console.log(data);
        // 用户进入房间，创建一个连接
        if (data.state === 2) {
          const peer = createPeer(state.localStream || false, data);
          state.peerList.push({
            ...data,
            peer
          });
        }
      });
      // 主机端只接收answer
      state.socket.on('message', data => {
        const { msg } = data;
        console.log('服务连接:', msg.type);
        if (msg.type === 'answer') {
          state.peerList.map(item => {
            if (item.userId === data.userId) {
              item.peer.setRemoteDescription(new RTCSessionDescription(msg));
            }
          });
        }
        if (msg.type === 'bye') {
          const leavePeer = state.peerList.find(item => item.userId === data.userId);
          leavePeer.peer.close();
          state.peerList = state.peerList.filter(item => item.userId !== data.userId);
        }
      });
    });
    return {
      ...toRefs(state),
      handleJoin,
      handleStop
    };
  }
};
</script>

<style lang="less">
.live-room {
  padding: 30px;
  .rx-btn {
    margin: 0 5px;
  }
  .video-wrap {
    margin-bottom: 30px;
  }
  #video {
    width: 980px;
    max-width: 100%;
    height: 450px;
    background: #333;
    outline: none;
  }
}
@media screen and (max-width: 980px) {
  .live-room {
    padding: 0;
  }
}
@media screen and (max-width: 680px) {
  .live-room {
    #video {
      height: 320px;
      max-height: 40%;
    }
  }
}
</style>
