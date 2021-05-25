<template>
  <div class="user-room">
    <div class="video-wrap">
      <video id="video" autoplay="autoplay" playsinline controls="controls"></video>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, reactive, toRefs } from '@vue/runtime-dom';
import { useLiveStart } from './composition';

export default {
  name: 'UserRoom',
  components: {
  },
  setup(props, context) {
    const currentDetail = {
      roomName: 'rxdey',
      client: '洞洞',
      userType: 2
    };

    const { socket, peer, sendMessage } = useLiveStart(currentDetail);

    onMounted(() => {
      const video = document.querySelector('#video');
      socket.emit('joinRoom', { roomName: currentDetail.roomName }, (res) => {
        console.log(`加入房间：${JSON.stringify(currentDetail.client)}`);
        // state 1：普通消息， 2 加入房间
        const msg = { msg: `${currentDetail.client}加入Room`, state: 2, ...currentDetail };
        socket.emit('sendMsg', msg);
      });
      peer.onaddstream = (obj) => {
        if (!video) {
          console.log('没有找到指定video元素');
          return;
        }
        video.srcObject = obj.stream;
        video.oncanplay = () => {
          // setTimeout(() => {
          //   video.play();
          // }, 1000);
          video.autoplay = 'autoplay';
        };
      };
      socket.on('receiveMsg', data => {
        const { state } = data;
        console.log(data);
      });
    });
    onUnmounted(() => {
      peer.close();
      socket.emit('leaveRoom', { roomName: currentDetail.roomName });
    });
    return {

    };
  }
};
</script>

<style lang="less">
.user-room {
  height: 100%;
  padding: 30px;
  .video-wrap {
    margin-bottom: 30px;
  }
  #video {
    width: 980px;
    min-height: 400px;
    background: #333;
    outline: none;
  }
}
</style>
