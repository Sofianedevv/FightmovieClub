import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import VersusView from '@/views/VersusView.vue';
import HistoryView from '@/views/HistoryView.vue';
import FavoritesView from '@/views/FavoritesView.vue';
import SearchView from '@/views/SearchView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SearchView
    },
    {
      path: '/versus',
      name: 'versus',
      component: VersusView
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView
    },
    {
      path: '/search',
      name: 'search',
      redirect: '/'
    }
  ]
});

export default router; 