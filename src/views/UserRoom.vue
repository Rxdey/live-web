<template>
  <div class="user-room">
    <div class="video-wrap">
      <video id="video" autoplay="autoplay" playsinline controls="controls"></video>
    </div>
  </div>
  <el-dialog title="加入吧" v-model="dialogVisible" width="30%" :before-close="handleClose" :show-close="false" center>
    <el-form label-position="left" label-width="100px" :model="userDetail">
      <el-form-item label="用户名">
        <el-input v-model="userDetail.client"></el-input>
      </el-form-item>
      <el-form-item label="roomName">
        <el-input v-model="userDetail.roomName"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { onMounted, onUnmounted, reactive, toRefs, ref, getCurrentInstance } from '@vue/runtime-dom';
import { onBeforeRouteLeave } from 'vue-router';
import { createId } from '@/common/util';
import { io } from 'socket.io-client';

export default {
  name: 'UserRoom',
  components: {
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance();
    // 用户信息
    const state = reactive({
      userDetail: {
        roomName: 'rxdey',
        client: '',
        userType: 2,
        userId: createId()
      },
      peer: null,
      socket: null
    });
    const dialogVisible = ref(true);

    const sendMessage = (message) => {
      const msg = { msg: message, ...state.userDetail };
      state.socket.emit('message', msg);
    };
    const handleClose = (done) => {
    };
    const handleSubmit = () => {
      if (!state.userDetail.roomName || !state.userDetail.client) {
        proxy.$message.warning('请输入昵称和房间');
        return;
      }
      window.localStorage.setItem('roomName', state.userDetail.roomName);
      window.localStorage.setItem('client', state.userDetail.client);
      dialogVisible.value = false;
      state.socket = io('http://127.0.0.1:3000');
      const video = document.querySelector('#video');
      state.peer = new RTCPeerConnection(null);
      state.peer.onaddstream = (obj) => {
        if (!video) { console.log('没有找到指定video元素'); return; }
        video.srcObject = obj.stream;
        video.oncanplay = () => {
          video.autoplay = 'autoplay';
          video.play();
        };
      };
      // 客户端接收offer和candidate
      state.socket.on('message', data => {
        const { msg } = data;
        console.log('服务连接:', msg.type);
        if (msg.type === 'candidate') {
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: msg.label,
            candidate: msg.candidate
          });
          state.peer.addIceCandidate(candidate);
        }
        if (msg.type === 'offer') {
          state.peer.setRemoteDescription(new RTCSessionDescription(msg));
          state.peer.createAnswer().then(
            sessionDescription => {
              state.peer.setLocalDescription(sessionDescription);
              sendMessage(sessionDescription);
            },
            error => { console.log(error); }
          );
        }
      });
      state.socket.on('receiveMsg', data => {
        console.log(data);
      });
      state.socket.emit('joinRoom', state.userDetail, (res) => {
        console.log(`加入房间：${JSON.stringify(state.userDetail.client)}`);
        const msg = { msg: `${state.userDetail.client}加入Room`, state: 2, ...state.userDetail };
        state.socket.emit('sendMsg', msg);
      });
    };
    onMounted(() => {
      // 初始化用户信息
      state.userDetail.roomName = window.localStorage.getItem('roomName') || state.userDetail.roomName;
      state.userDetail.client = window.localStorage.getItem('client') || '';
    });
    onBeforeRouteLeave((to, from, next) => {
      if (state.peer && state.socket) {
        state.socket.emit('leaveRoom', state.userDetail);
      }
      next();
    });
    return {
      ...toRefs(state),
      dialogVisible,
      handleClose,
      handleSubmit
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
    max-width: 100%;
    height: 450px;
    background: #333;
    outline: none;
  }
}
.el-dialog--center {
  min-width: 320px;
}
@media screen and (max-width: 980px) {
  .user-room {
    padding: 0;
  }
}
@media screen and (max-width: 680px) {
  .user-room {
    #video {
      height: 320px;
      max-height: 40%;
    }
  }
}
</style>
