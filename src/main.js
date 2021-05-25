import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import App from './App.vue';
import router from './router';
import store from './store';
import 'element-plus/lib/theme-chalk/index.css';

const app = createApp(App);
router.beforeEach((to, from, next) => {
  if (to.meta.title)document.title = to.meta.title;
  next();
});
app.use(ElementPlus);
app.use(store);
app.use(router);
app.mount('#app');
