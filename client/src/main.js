// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import Resource from 'vue-resource'
import axios from 'axios'
import Router from 'vue-router'
import Vuex from 'vuex'
import store from './vuex/store'
import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(Router);
Vue.use(Resource);
Vue.use(Vuex);
Vue.use(iView);

Vue.config.productionTip = false;
Vue.http.options.root = 'http://localhost:3000/';
Vue.http.options.emulateJson = true;
Vue.use(axios)

new Vue({
  render: h => h(App),
  store
}).$mount('#app');
