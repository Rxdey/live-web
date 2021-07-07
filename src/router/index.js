import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '开始吧'
    }
  },
  {
    path: '/LiveRoom',
    name: 'LiveRoom',
    component: () => import('../views/LiveRoom.vue'),
    meta: {
      title: '主页'
    }
  },
  {
    path: '/UserRoom',
    name: 'UserRoom',
    component: () => import('../views/UserRoom.vue'),
    meta: {
      title: '观看页'
    }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  base: '/',
  routes
});

export default router;
