import { createApp } from 'vue';
import Button from '@/components/Button/Button.vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);
router.beforeEach((to, from, next) => {
  // console.log(to);
  if (to.meta.title)document.title = to.meta.title;
  next();
});
app.use(store);
app.use(router);
app.component(Button.name, Button);
app.mount('#app');
