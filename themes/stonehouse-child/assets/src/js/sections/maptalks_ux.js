// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker, LineString } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster/dist/maptalks.markercluster'
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer'

import { defaults } from '../constants/defaults'
import { GPS } from './inc/GPS'
import { ManageLocation } from './inc/ManageLocation'
import { createElementFromHTML } from '../utils/dom_from_string'
import { MapBoxRoutes } from './inc/MapBoxRoutes'
import { markerTemplate } from './inc/items/markerTemplate'
import { coord } from "./inc/items/coord"
import { myLocation } from './inc/items/menu/myLocation'
import { locations } from './inc/items/menu/locations'

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

export class MaptalksUX {

    mapContainer;
    details;

    map;
    cluster;
    baseLayer;
    menu;

    mouseHasMoved = null
    timerId = null


    constructor(initialLocation) {

        this.mapContainer = document.querySelector('.maps')

        this.map = this.initMap(initialLocation)
        
        // Bad Clusters animations
        this.cluster = new ClusterLayer('cluster').addTo(this.map)
        this.cluster.config('animationDuration', 1)

        this.menu = this.initMenu()
        this.menu.addTo(this.map)


        // JS DOM three OR Main
        this.location = new ManageLocation({

            map: this.map,
            menu: this.menu,
            cluster: this.cluster,

            mapBox: new MapBoxRoutes({

                map: this.map,
                cluster: this.cluster,
                gps: new GPS({

                    map: this.map,
                    setHtmlMarker: this.setHtmlMarker,
                    Coordinate,
                    Polygon,
                    VectorLayer
                }),

                LineVector: new VectorLayer( 'line' ).addTo( this.map ),
                LineString,
                createElementFromHTML,
                coord,
                lineColor: 'red'
            }),

            Coordinate,
            markerTemplate,
            coord,
            createElementFromHTML,
            setMarker: this.setMarker,
            setHtmlMarker: this.setHtmlMarker
        })


        this.map.on('mousedown', ev => this.addMarkerLongPress(ev))
        this.map.on('mousemove', () => this.mouseHasMoved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement )
            this.map.on('contextmenu', e => this.location.saveMarker( e.coordinate ))

        this.map.sortLayers(['line', 'cluster'])
        // this.map.on('click', ev => console.log(ev.coordinate))
    }


    initMap(initialLocation) {

        this.baseLayer = new TileLayer('base', {
            urlTemplate: defaults.geografica,
            subdomains: ["a","b","c","d", "e"],
            attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
        })

        return new Map('stonemap', {
            center: [ initialLocation.longitude, initialLocation.latitude ],
            zoom: 14,
            baseLayer: this.baseLayer
        })
    }


    initMenu() {
        return new control.Toolbar({
            'vertical' : true,
            'position' : { 'top' : 20, 'left' : 20 },
            'reverseMenu' : true,
            'cssName': 'primary-map-menu',
            'items': [
                {
                    item: myLocation(),
                    click : () => {
                        if ( !this.location.mapBox.gps.status ) {

                            this.location.mapBox.gps.startLocation()
                
                        } else {
                
                            this.location.mapBox.gps.status = false
                            this.location.mapBox.gps.marker.remove()
                            this.location.mapBox.gps.marker = null
                            this.location.mapBox.gps.accuracyLayer.remove()
                            this.location.mapBox.gps.stopWatch()
                        }
                    }
                },
                {
                    item: locations(),
                    click : () => {
                        this.mapContainer.classList.toggle('show-houses')
                    },
                }
            ]
        })
    }


    setMarker(coordinate, type = 'default') {
        return new Marker( coordinate, {
            'symbol' : markerTemplate(type)
        })
    }


    setHtmlMarker(coordinate, content, alignment = 'top') {

        return new ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content,
            'verticalAlignment' : alignment
        })
    }


    addMarkerLongPress( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouseHasMoved ) {
                // console.log(e.coordinate)
                this.location.saveMarker( e.coordinate )
            }
        }, 800)

        this.mouseHasMoved = false
    }
}