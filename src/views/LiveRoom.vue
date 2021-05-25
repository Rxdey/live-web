<template>
  <div class="live-room">
    <div class="video-wrap">
      <video id="video" autoplay playsinline controls="controls"></video>
    </div>
    <div class="button-wrap">
      <rx-button type="red" @click="handleJoin">开始</rx-button>
      <rx-button @click="handleStop">停止</rx-button>
    </div>
  </div>
</template>

<script>
import { reactive, ref, toRefs, onMounted, onUnmounted } from '@vue/runtime-dom';
import { useLiveStart } from './composition';

export default {
  name: 'LiveRoom',
  components: {
  },
  setup(props, context) {
    const currentDetail = {
      roomName: 'rxdey',
      client: 'Up',
      userType: 1
    };

    const { socket, peer, sendMessage } = useLiveStart(currentDetail, true);
    // 创建offer
    const createOffer = (cp) => {
      cp.createOffer(sessionDescription => {
        peer.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message');
        sendMessage(socket, sessionDescription);
      }, error => {
        console.log(error);
      });
    };
    onMounted(async () => {
      socket.emit('joinRoom', { roomName: currentDetail.roomName }, async (data) => {
        console.log(`加入房间：${JSON.stringify(data)}`);
      });
      socket.on('receiveMsg', data => {
        const { state } = data;
        if (state === 2) {
          createOffer(peer);
        }
        console.log(data);
      });
    });
    onUnmounted(() => {
      peer.close();
      socket.emit('leaveRoom', { roomName: currentDetail.roomName });
    });

    const handleJoin = async () => {
      const video = document.querySelector('#video');
      const localstream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      video.srcObject = localstream;
      peer.onicecandidate = (event) => {
        if (!event.candidate) return;
        sendMessage(socket, {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      };
      peer.addStream(localstream);
      createOffer(peer);
    };
    const handleStop = async () => {
      if (!peer) return;
      peer.close();
    };

    return {
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
    width: 800px;
    height: 400px;
    background: #333;
    outline: none;
  }
}
</style>
