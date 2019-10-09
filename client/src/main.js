// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import Resource from 'vue-resource'
import Router from 'vue-router'
import Vuex from 'vuex'
import store from './vuex/store'

import axios from 'axios'
import qs from 'qs'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

Vue.use(Resource);
Vue.use(Router);
Vue.use(Vuex);


Vue.config.productionTip = false;
Vue.http.options.root = 'http://localhost:3000/';
Vue.http.options.emulateJson = true;

new Vue({
  render: h => h(App),
  store
}).$mount('#app');
