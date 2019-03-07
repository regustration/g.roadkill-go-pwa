import Vue from 'vue'
import Vuetify from 'vuetify'
import './assets/styles/main.styl'

import App from './App.vue'
import router from './router'
import './registerServiceWorker'

import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

Vue.use(Vuetify)

// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
