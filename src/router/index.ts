import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import VersusView from '@/views/VersusView.vue';
import HistoryView from '@/views/HistoryView.vue';
import FavoritesView from '@/views/FavoritesView.vue';
import DetailView from '@/views/DetailView.vue';
import TinderView from '@/views/DiscoverView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
      path: '/detail/:type/:id',
      name: 'detail',
      component: DetailView
    },
    {
      path: '/tinder',
      name: 'tinder',
      component: TinderView
    }
  ]
});

export default router; 