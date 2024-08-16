// import { LeafletUX } from "../user_experience/leaflet_ux"

// new Promise( async (resolve) => {

//     const response = await fetch('https://ip-geo-location.p.rapidapi.com/ip/check?format=json&language=en', {
//         method: 'GET',
//         headers: {
//             'x-rapidapi-key': '77bc1a30eamsha0c29e7a0814603p19ceffjsnd0ad03731219',
//             'x-rapidapi-host': 'ip-geo-location.p.rapidapi.com'
//         }
//     })

//     resolve( response.json() )

// }).then( val => new LeafletUX( val.location ) )

// import { createCanvas, loadImage } from 'canvas'
import * as maptalks from 'maptalks'
import marker_icon from '../../images/marker.svg'
// import { ThreeLayer } from 'maptalks.three'

// const canvas = createCanvas(200, 200);

// const map = new maptalks.Map(canvas, {
//   center : [0, 0],
//   zoom : 1
// });

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

const map = new maptalks.Map('stonemap', {
    center: [-0.113049,51.498568],
    zoom: 14,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        subdomains: ["a","b","c","d", "e"],
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    })
})


map.on('click', (e) => {

    const marker = new maptalks.ui.UIMarker(e.coordinate, {
        'draggable'     : false,
        'single'        : false,
        'content'       : `<img src="${marker_icon}" class="marker_icon" />`,
        'verticalAlignment' : 'top'
    })

    marker.addTo(map).show()
})

// const layer = new ThreeLayer('three');
