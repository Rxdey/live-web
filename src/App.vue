<template>
  <div class="main">
    <router-view />
  </div>
</template>

<style lang="less">
@import url("./assets/less/reset.less");
body {
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  overflow-y: auto;
  background: #f7f7f7 url("/img/bg.jpg") no-repeat center;
  background-size: cover;
}
.header {
  background: #fff;
}
.main {
  width: 80%;
  max-width: 1504px;
  padding: 30px 0;
  margin: 0 auto;
}

.router-page {
  width: 100%;
}
@media screen and (max-width: 1480px) {
  .main {
    width: 90%;
  }
}
@media screen and (max-width: 1200px) {
  .main {
    width: 96%;
    .live-wrap {
      margin-right: 0;
      margin-bottom: 20px;
    }
    .live-aside {
      width: 100%;
    }
    .message-wrap {
      padding: 30px 0 5px 0;
      height: 200px;
    }
  }
}
@media screen and (max-width: 880px) {
  .main {
    width: 100%;
    padding: 0;
    height: 100%;
    .live-room {
      display: flex;
      flex-flow: column;
      height: 100%;
    }
    .live-wrap {
      margin: 0;
      min-width: 100%;
      flex: 1;
      height: 1px;
    }
    .video-wrap {
      border-radius: 0;
      height: 100%;
      padding: 0;
      display: flex;
      flex-flow: column;
      .video-main {
        margin-bottom: 0px;
        height: 1px;
        flex: 1;
      }
      .video-control {
        height: 100%;
      }
      .room-name {
        font-size: 12px;
        margin-bottom: 0;
        padding: 10px 8px;
      }
    }
    .tool-wrap {
      padding: 8px 0;
    }
    .live-aside {
      width: 100%;
    }
    .message-wrap {
      padding: 0 0 10px 0;
      height: 180px;
      border-radius: 0;
      // background: transparent;
      // .user-message {
      //   background: rgba(255, 255, 255, 0.9);
      // }
    }
  }
}
</style>
