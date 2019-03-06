<template>
  <div class="vue-leaflet">
    <l-map style="width: 100%; height: calc(100vh - 78px);" :zoom="zoom" :center="center" ref="leaflet">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker :lat-lng="marker">
        <l-popup :content="text"></l-popup>
      </l-marker>
      <l-control position="bottomleft" >
        <button @click="onStart">Tracking!</button>
        <button @click="onStop">Stop</button>
      </l-control>
    </l-map>
  </div>
</template>

<script>
import { uniqWith } from 'lodash/uniqWith'
import { isEqual } from 'lodash/isEqual'

export default {
  name: 'home',
  data () {
    return {
      userMarker: null,
      coords: [],
      isWatch: false,
      watchId: null,
      trackId: '',
      trackingData: [],
      trackInfo: {
        totalDistance: []
      },
      zoom: 13,
      center: window.L.latLng(47.413220, -1.219482),
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: window.L.latLng(47.413220, -1.219482),
      text: 'this is a marker'
    }
  },
  computed: {
    getLocation () {
      return uniqWith(this.coords, isEqual)
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
    onStart () {
      this.isWatch = 1
      this.onWatch()
    },
    onStop () {
      this.isWatch = 0
      this.offWatch()
    },
    offWatch () {
      navigator.geolocation.clearWatch(this.watchId)
    },
    onWatch () {
      if (!this.isWatch) return
      this.watchId = navigator.geolocation.watchPosition(
        position =>
          this.addMarker(position.coords.latitude, position.coords.longitude),
        err => console.warn(err),
        {
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 0,
          distanceFilter: 1
        }
      )
    },
    addMarker (lat, lng) {
      const map = this.$refs.leaflet.mapObject
      if (this.userMarker) {
        map.removeLayer(this.userMarker)
      }
      const L = window.L
      this.coords.push(L.latLng(lat, lng))
      this.userMarker = L.marker(L.latLng(lat, lng)).addTo(map)
      const line = L.polyline(this.coords)
      map.fitBounds(line.getBounds())
      map.addLayer(line)
      map.panTo([lat, lng], 18)
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
