import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/LiveRoom',
    name: 'LiveRoom',
    component: () => import('../views/LiveRoom.vue')
  },
  {
    path: '/UserRoom',
    name: 'UserRoom',
    component: () => import('../views/UserRoom.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
