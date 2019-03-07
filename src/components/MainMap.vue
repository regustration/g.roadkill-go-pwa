<template>
  <div class="vue-leaflet" :class="{ 'is-tracking': isTracking }">
    <l-map style="width: 100%; height: 100vh;" :zoom="zoom" :center="center" :options="{zoomControl: false}" ref="leaflet">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <div v-for="(coord, i) in coords" :key="i">
        <l-polyline :lat-lngs="coord" :color="polyline.color"></l-polyline>
      </div>
      <l-circle-marker :lat-lng="marker" class-name="current-spot"></l-circle-marker>

      <l-control-zoom position="bottomright"  ></l-control-zoom>
      <l-control-scale position="bottomright" :imperial="false"></l-control-scale>

      <l-control position="bottomleft">
        <v-btn color="light-green" @click="startTracking" dark v-if="!isTracking">開始記錄</v-btn>
        <v-btn color="#ff5252" @click="stopTracking" dark v-if="isTracking">結束</v-btn>
      </l-control>
    </l-map>
  </div>
</template>

<script>
import { uniqWith } from 'lodash/uniqWith'
import { isEqual } from 'lodash/isEqual'
import { LMap, LTileLayer, LMarker, LCircleMarker, LPopup, LControl, LControlScale, LControlZoom, LPolyline } from 'vue2-leaflet'

export default {
  name: 'MainMap',
  components: { LMap, LTileLayer, LMarker, LCircleMarker, LPopup, LControl, LControlScale, LControlZoom, LPolyline },
  data () {
    return {
      coords: [],
      isTracking: false,
      watchId: null,
      trackId: '',
      trackInfo: {
        totalDistance: []
      },
      polyline: {
        latlngs: [],
        color: 'green'
      },
      zoom: 18,
      center: [25.033967, 121.564476],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: [25.033967, 121.564476],
      text: 'this is a marker'
    }
  },
  computed: {
    getLocation () {
      const coords = this.coords
      return uniqWith(coords[coords.length - 1], isEqual)
    },
    totalDistance () {
      const coords = this.getLocation
      const currLoc = coords[coords.length - 1]
      const prevLoc = coords[coords.length - 2]
      if (prevLoc && currLoc) {
        this.trackInfo.totalDistance += this.gpsDistance(prevLoc.lat, prevLoc.lng, currLoc.lat, currLoc.lng)
        return this.trackInfo.totalDistance
      }
      return null
    }
  },
  methods: {
    startTracking () {
      this.isTracking = 1
      this.coords.push([])
      this.onWatch()
    },
    stopTracking () {
      this.isTracking = 0
      this.offWatch()
    },
    offWatch () {
      navigator.geolocation.clearWatch(this.watchId)
    },
    onWatch () {
      if (!this.isTracking) return
      this.watchId = navigator.geolocation.watchPosition(
        position =>
          this.moveTracker(position.coords.latitude, position.coords.longitude),
        err => console.warn(err),
        {
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 0,
          distanceFilter: 1
        }
      )
    },
    addRecord () {

    },
    moveTracker (lat, lng) {
      const coords = this.coords
      coords[coords.length - 1].push([lat, lng])
      this.marker = [lat, lng]
      this.center = [lat, lng]
      this.zoom = 18
    },
    gpsDistance (lat1, lng1, lat2, lng2) {
      // http://www.movable-type.co.uk/scripts/latlong.html
      const R = 6371 // km
      const dLat = (lat2 - lat1) * (Math.PI / 180)
      const dLng = (lng2 - lng1) * (Math.PI / 180)
      lat1 = lat1 * (Math.PI / 180)
      lat2 = lat2 * (Math.PI / 180)
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      let d = R * c
      return d
    }
  }
}
</script>

<style lang="stylus">
.vue-leaflet
  width: 100%;

.leaflet-bottom.leaflet-right
  display grid
  grid-template-columns max-content max-content
  grid-template-areas "scale zoom" \ "contributors contributors"
  align-items center
  justify-items center

  .leaflet-control-scale
    grid-area scale

  .leaflet-control-zoom
    grid-area zoom

  .leaflet-control-attribution
    grid-area contributors

.is-tracking .current-spot {
  animation pulse 1.5s ease-out
  animation-iteration-count infinite
}

@keyframes pulse {
  from {
    stroke-width 0
    stroke-opacity 0.8
  }

  to {
    stroke-width 50
    stroke-opacity 0
  }
}
</style>
