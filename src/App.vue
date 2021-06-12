<template>
  <el-container>
    <el-header class="header" height="50px"></el-header>
    <el-main class="main">
      <router-view/>
    </el-main>
  </el-container>
</template>

<style lang="less">
@import url("./assets/less/reset.less");
body {
  background: #f7f7f7 url("/img/bg.jpg") no-repeat center;
  background-size: cover;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.header {
  background: #fff;
}
.el-main.main {
  max-width: 1504px;
  min-width: 1220px;
  // padding: 10px;
  width: 80%;
  margin: 0 auto;
}

.router-page {
  width: 100%;
}
</style>
