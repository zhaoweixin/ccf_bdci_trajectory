// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import Resource from 'vue-resource'
import axios from 'axios'

Vue.use(Resource);

Vue.config.productionTip = false;
Vue.http.options.root = 'http://localhost:3000/';
Vue.http.options.emulateJson = true;
Vue.use(axios)

new Vue({
  render: h => h(App),
}).$mount('#app');
