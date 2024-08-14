import marker from '../../images/marker.svg'
import marker_success from '../../images/marker_success.svg'
import marker_error from '../../images/marker_error.svg'

export const leaflet = {
    save_point_map: '<svg fill="#000000" width="50px" height="50px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg"><path d="M1524.824 1242.353c93.402 0 169.411 76.01 169.411 169.412v338.823c0 93.403-76.01 169.412-169.411 169.412H395.412C302.009 1920 226 1843.99 226 1750.588v-338.823c0-93.403 76.01-169.412 169.412-169.412ZM1016.588 0v338.824h-112.94V0h112.94ZM564.824 1468.235c62.343 0 112.94 50.71 112.94 112.941s-50.597 112.942-112.94 112.942c-62.344 0-112.942-50.71-112.942-112.942 0-62.23 50.598-112.94 112.942-112.94ZM903.647 338.824v428.385L657.322 520.885l-79.85 79.85 382.646 382.644 382.644-382.645-79.85-79.85-246.324 246.325V338.824h508.236c93.74 0 169.411 75.67 169.411 169.411v677.647c-46.306-35.011-106.164-56.47-169.411-56.47H395.412c-63.247 0-123.106 21.459-169.412 56.47V508.235c0-93.74 75.67-169.411 169.412-169.411h508.235Z" fill-rule="evenodd"/></svg><p class="save-label">Save</p>',
    marker: L.icon({
        className: "leaflet-data-marker-cursor",
        iconUrl: marker,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60]
    }),
    marker_success: L.icon({
        className: "leaflet-data-marker-cursor",
        iconUrl: marker_success,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60]
    }),
    marker_error: L.icon({
        className: "leaflet-data-marker-cursor",
        iconUrl: marker_error,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -60]
    }),
    point_marker: L.divIcon({
        className: "leaflet-data-marker-cursor",
        html: L.Util.template('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;animation: leaflet-control-locate-throb 4s ease infinite;"></circle></svg>'),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }),
    topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
    selected: "topografica",

    bigMap: (init) => L.map('stonemap', {
        center: L.latLng(init.latitude || 0, init.longitude || 0),
        zoom: 14,
        minZoom: 3,
    }),

    miniMap: (init) => L.map('mini-map', {
        center: L.latLng(init.latitude || 0, init.longitude || 0),
        zoom: 11,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        attributionControl: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
    }),

    addController: ({map, icon, handler, position = 'topleft'}) => {

        L.Control.Watermark = L.Control.extend({
            onAdd: () => {
    
                const img = L.DomUtil.create('img')
                img.src = icon
    
                img.classList.add('leaflet-control')
                img.classList.add('leaflet-bar')
                img.classList.add('my-houses')
    
                img.addEventListener('click', ev => handler(ev), false)
    
                return img
            }
        })
    
        L.control.watermark = (opts) => new L.Control.Watermark(opts)
        L.control.watermark({ position }).addTo(map)
    },

    initLayers: ({map, miniature, topografica, geografica, roards}) => {

        const big_map = L.tileLayer(topografica, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            subdomains: 'abcd',
            maxZoom: 18
        }).addTo(map)

        L.tileLayer(roards, {
            subdomains: 'abcd',
            maxZoom: 18
        }).addTo(map)

        return {
            map: big_map,
            mini: L.tileLayer(geografica).addTo(miniature),
        }
    }
}