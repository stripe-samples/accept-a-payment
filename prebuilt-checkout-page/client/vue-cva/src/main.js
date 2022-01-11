import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

import SrCheckout from './components/SrCheckout.vue'
import SrSuccess from './components/SrSuccess.vue'
import SrCanceled from './components/SrCanceled.vue'

import "./assets/normalize.css"
import "./assets/global.css"

const routes = [
  { path: '/', component: SrCheckout },
  { path: '/canceled.html', component: SrCanceled }, 
  { path: '/success.html', component: SrSuccess }, 
]

const history = createWebHistory();

const router = new createRouter({
  history,
  routes
});

createApp(App).use(router).mount('#app')
