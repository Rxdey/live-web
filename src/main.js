import { createApp } from 'vue';
import Button from '@/components/Button/Button.vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);
app.use(store);
app.use(router);
app.component(Button.name, Button);
app.mount('#app');
