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
            <el-switch class="swuitc" v-model="mediaType" active-text="摄像头" inactive-text="屏幕" :disabled="!!localStream"/>
            <el-button size="small" round type="primary" @click="handleJoin" :disabled="!!localStream">开始</el-button>
            <el-button size="small" round @click="handleStop" :disabled="!localStream">停止</el-button>
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

  <el-dialog title="创建一个房间哦" v-model="dialogVisible" width="30%" :before-close="handleClose" :show-close="false" center>
    <el-form label-position="left" label-width="100px" :model="userDetail">
      <el-form-item label="昵称">
        <el-input v-model="userDetail.client" maxlength="12"></el-input>
      </el-form-item>
      <el-form-item label="房间号">
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
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from '@vue/runtime-dom';
import { io } from 'socket.io-client';
import { onBeforeUnmount } from '@vue/runtime-core';
import { createId } from '@/common/util';
import option from './conf';

export default {
  name: 'LiveRoom',
  components: {
  },
  setup (props, context) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      userDetail: {
        roomName: 'rxdey',
        client: '',
        userType: 1,
        userId: createId()
      },
      peerList: [],
      localStream: null,
      socket: null,
      messageList: [],
      mediaType: false
    });
    const msgVal = ref('');
    const dialogVisible = ref(true);

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
    // 创建RTCPeerConnection连接
    const createPeer = (stream, data) => {
      // const peer = new RTCPeerConnection({ sdpSemantics: 'unified-plan' });
      const peer = new RTCPeerConnection(option);
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
      sendMessage({ type: 'upJoin' });
      // const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const localStream = state.mediaType ? await navigator.mediaDevices.getUserMedia({ video: true, audio: true }) : await navigator.mediaDevices.getDisplayMedia({ video: { MediaSource: 'screen' } });
      video.srcObject = localStream;
      state.localStream = localStream;
      state.peerList.map(item => {
        item.peer.addStream(localStream);
        createOffer(item.peer);
      });
    };
    const handleStop = () => {
      state.peerList.forEach(item => {
        item.peer.removeStream(state.localStream);
      });
      state.localStream.getTracks().forEach(track => track.stop());
      document.querySelector('#video').currentTime = 0;
      document.querySelector('#video').pause();
      state.socket.emit('close', state.userDetail);
      state.peerList = [];
      state.localStream = null;
    };
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
    const handleClose = () => { };
    const handleSubmit = () => {
      if (!state.userDetail.roomName || !state.userDetail.client) {
        proxy.$message.warning('请输入昵称和房间');
        return;
      }
      if (!/^[0-9a-zA-Z]+$/.test(state.userDetail.roomName)) {
        proxy.$message.warning('房间号只能输入数字或字母');
        return;
      }
      window.localStorage.setItem('upRoomName', state.userDetail.roomName);
      window.localStorage.setItem('upClient', state.userDetail.client);
      dialogVisible.value = false;
      state.socket = io(process.env.VUE_APP_SERVICE);
      state.socket.emit('joinRoom', state.userDetail, (data) => {
        console.log(`up加入房间：${JSON.stringify(data)}`);
      });
      state.socket.on('receiveMsg', data => {
        // 用户进入房间，创建一个连接
        if (data.state === 2) {
          const peer = createPeer(state.localStream || false, data);
          state.peerList.push({
            ...data,
            peer
          });
        }
        if (data.state === 3) {
          const { client, msg, userId } = data;
          createMessage(userId, client, msg);
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
    };
    onMounted(() => {
      // 初始化用户信息
      state.userDetail.roomName = window.localStorage.getItem('upRoomName') || state.userDetail.roomName;
      state.userDetail.client = window.localStorage.getItem('upClient') || '';
    });
    onBeforeUnmount(() => {
      state.socket.emit('close', state.userDetail);
    });
    return {
      ...toRefs(state),
      msgVal,
      dialogVisible,
      handleJoin,
      handleStop,
      handleSendMessage,
      handleClose,
      handleSubmit
    };
  }
};
</script>

<style lang="less">
@import url("./live.less");
</style>
