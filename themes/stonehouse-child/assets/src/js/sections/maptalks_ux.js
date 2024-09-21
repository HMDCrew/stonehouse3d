// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker, LineString } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster/dist/maptalks.markercluster'
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer'

import { defaults } from '../constants/defaults'
import { GPS } from './inc/GPS'
import { ManageLocation } from './inc/ManageLocation'
import { createElementFromHTML } from '../utils/dom_from_string'
import { MapBoxRoutes } from './inc/MapBoxRoutes'
import { markerTemplate } from './inc/items/MarkerTemplate'
import { coord } from "./inc/items/coord"

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

    mouse_has_moved = null
    timerId = null


    constructor(initial_location) {

        this.mapContainer = document.querySelector('.maps')

        this.map = this.init_map(initial_location)
        
        // Bad Clusters animations
        this.cluster = new ClusterLayer('cluster').addTo(this.map)
        this.cluster.config('animationDuration', 1)

        this.menu = this.init_menu()
        this.menu.addTo(this.map)


        // JS DOM reorganization on progress....
        this.map_box = new MapBoxRoutes({
            map: this.map,
            cluster: this.cluster,
            gps: new GPS({
                map: this.map,
                set_html_marker: this.set_html_marker,
                Coordinate,
                Polygon,
                VectorLayer
            }),
            LineVector: new VectorLayer( 'line' ).addTo( this.map ),
            LineString,
            createElementFromHTML,
            coord,
            lineColor: 'red'
        })

        this.location = new ManageLocation({
            map: this.map,
            menu: this.menu,
            cluster: this.cluster,
            map_box: this.map_box,
            Coordinate,
            markerTemplate,
            coord,
            createElementFromHTML,
            set_marker: this.set_marker,
            set_html_marker: this.set_html_marker
        })


        this.map.on('mousedown', ev => this.add_marker_long_press(ev))
        this.map.on('mousemove', () => this.mouse_has_moved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement )
            this.map.on('contextmenu', e => this.location.set_save_marker( e.coordinate ))

        this.map.sortLayers(['line', 'cluster'])
        // this.map.on('click', ev => console.log(ev.coordinate))
    }


    init_map(initial_location) {

        this.baseLayer = new TileLayer('base', {
            urlTemplate: defaults.geografica,
            subdomains: ["a","b","c","d", "e"],
            attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
        })

        return new Map('stonemap', {
            center: [ initial_location.longitude, initial_location.latitude ],
            zoom: 14,
            baseLayer: this.baseLayer
        })
    }



    init_menu() {
        return new control.Toolbar({
            'vertical' : true,
            'position' : { 'top' : 20, 'left' : 20 },
            'reverseMenu' : true,
            'cssName': 'primary-map-menu',
            'items': [
                {
                    item: defaults.menu.my_location,
                    click : () => {
                        if ( !this.map_box.gps.status ) {

                            this.map_box.gps.startLocation()
                
                        } else {
                
                            this.map_box.gps.status = false
                            this.map_box.gps.marker.remove()
                            this.map_box.gps.marker = null
                            this.map_box.gps.accuracyLayer.remove()
                            this.map_box.gps.stopWatch()
                        }
                    }
                },
                {
                    item: defaults.menu.houses,
                    click : () => {
                        this.mapContainer.classList.toggle('show-houses')
                    },
                }
            ]
        })
    }


    
   

    set_marker(coordinate, type = 'default') {

        return new Marker( coordinate, {
            'symbol' : markerTemplate(type)
        })
    }


    set_html_marker(coordinate, content, alignment = 'top') {

        return new ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content,
            'verticalAlignment' : alignment
        })
    }












    add_marker_long_press( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouse_has_moved ) {
                // console.log(e.coordinate)
                this.location.set_save_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }
}