<template>
  <div class="live-room router-page">
    <div class="live-wrap">
      <div class="video-wrap">
        <p class="room-name">房间号: {{userDetail.roomName}}</p>
        <div class="video-main">
          <video id="video" class="video-control" autoplay playsinline controls></video>
        </div>
        <div class="tool-wrap">
          <div class="button-wrap">
            <el-button size="small" round type="primary" @click="handleReload">刷新</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="live-aside">
      <div class="message-wrap">
        <div class="user-message">
          <div class="message-card" v-for="(item, index) in messageList" :key="index">
            <div class="message-card__message" :class="{active: userDetail.userId === item.userId}">
              <span class="name">{{item.name}}: </span>
              <span class="msg">{{item.msg}}</span>
            </div>
          </div>
        </div>
        <div class="user-input">
          <input type="text" maxlength="20" v-model="msgVal" placeholder="发送消息吧~" @keydown.enter="handleSendMessage">
          <p class="tip">{{msgVal.length}}/20</p>
        </div>
        <div class="user-button">
          <el-button size="mini" round type="primary" @click="handleSendMessage">发送</el-button>
        </div>
      </div>
    </div>
  </div>

  <el-dialog title="加入房间哦" v-model="dialogVisible" width="30%" :before-close="handleClose" :show-close="false" center>
    <el-form label-position="left" label-width="100px" :model="userDetail">
      <el-form-item label="昵称">
        <el-input v-model="userDetail.client" maxlength="12"></el-input>
      </el-form-item>
      <el-form-item label="房间号">
        <el-input v-model="userDetail.roomName" placeholder="要知道对方房间号才能连接哦"></el-input>
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
import { onMounted, reactive, toRefs, ref, getCurrentInstance } from '@vue/runtime-dom';
import { onBeforeRouteLeave } from 'vue-router';
import { createId } from '@/common/util';
import { io } from 'socket.io-client';
import option from './conf';

export default {
  name: 'UserRoom',
  components: {
  },
  setup (props, context) {
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
      socket: null,
      stream: null,
      messageList: []
    });
    const msgVal = ref('');
    const dialogVisible = ref(true);

    const sendMessage = (message) => {
      const msg = { msg: message, ...state.userDetail };
      state.socket.emit('message', msg);
    };
    const handleClose = (done) => { };
    const createMessage = (userId, name, msg) => {
      state.messageList.push({ userId, name, msg });
    };
    const handleSendMessage = () => {
      if (!msgVal.value.trim()) {
        return;
      }
      // 2 加入房间 3 普通消息
      const msg = { msg: msgVal.value, state: 3, ...state.userDetail };
      createMessage(state.userDetail.userId, state.userDetail.client, msgVal.value);
      state.socket.emit('sendMsg', msg, () => {
        msgVal.value = '';
      });
    };
    const createPeer = () => {
      const video = document.querySelector('#video');
      // state.peer = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
      state.peer = new RTCPeerConnection(option);
      state.peer.onaddstream = (obj) => {
        if (!video) { console.log('没有找到指定video元素'); return; }
        video.srcObject = obj.stream;
        state.stream = obj.stream;
        video.oncanplay = () => {
          video.autoplay = 'autoplay';
          video.play();
        };
      };
    };
    const joinRoom = () => {
      state.socket.emit('joinRoom', state.userDetail, (res) => {
        console.log(`加入房间：${JSON.stringify(state.userDetail.client)}`);
        const msg = { msg: `${state.userDetail.client}加入Room`, state: 2, ...state.userDetail };
        if (!state.peer) {
          createPeer();
        }
        state.socket.emit('sendMsg', msg);
      });
    };
    const handleSubmit = () => {
      if (!state.userDetail.roomName || !state.userDetail.client) {
        proxy.$message.warning('请输入昵称和房间');
        return;
      }
      if (!/^[0-9a-zA-Z]+$/.test(state.userDetail.roomName)) {
        proxy.$message.warning('房间号只能输入数字或字母');
        return;
      }
      window.localStorage.setItem('roomName', state.userDetail.roomName);
      window.localStorage.setItem('client', state.userDetail.client);
      dialogVisible.value = false;
      state.socket = io(process.env.VUE_APP_SERVICE);
      createPeer();
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
        if (msg.type === 'upJoin') {
          joinRoom();
        }
      });
      state.socket.on('receiveMsg', data => {
        if (data.state === 3) {
          const { client, msg, userId } = data;
          createMessage(userId, client, msg);
        }
      });
      state.socket.on('close', data => {
        console.log('主播已离开', state.stream);
        if (!state.stream) return;
        state.peer.removeStream(state.stream);
        state.stream.getTracks().forEach(track => track.stop());
        document.querySelector('#video').currentTime = 0;
        document.querySelector('#video').pause();
        state.peer = null;
        state.stream = null;
      });
      joinRoom();
    };
    const handleReload = () => {
      if (state.stream) {
        state.peer.removeStream(state.stream);
        state.stream.getTracks().forEach(track => track.stop());
        document.querySelector('#video').currentTime = 0;
        document.querySelector('#video').pause();
      }
      state.peer = null;
      state.stream = null;
      handleSubmit();
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
      msgVal,
      dialogVisible,
      handleClose,
      handleSubmit,
      handleSendMessage,
      handleReload
    };
  }
};
</script>

<style lang="less">
@import url("./live.less");
</style>
