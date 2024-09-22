// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker, LineString } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster/dist/maptalks.markercluster'
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer'

import { defaults } from '../constants/defaults'
import { GPS } from './inc/GPS'
import { ManageLocations } from './inc/ManageLocations'
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
        this.manager = new ManageLocations({


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
            this.map.on('contextmenu', e => this.manager.saveMarker( e.coordinate ))

        this.map.sortLayers(['line', 'cluster'])
        // this.map.on('click', ev => console.log(ev.coordinate))
    }


    /**
     * The function `initMap` creates a new map centered on a specified location with a base layer
     * using OpenStreetMap tiles.
     * @param initialLocation - The `initialLocation` parameter is an object that contains the
     * longitude and latitude coordinates of the initial location where the map will be centered. It is
     * used to set the center of the map when initializing it in the `initMap` function.
     * @returns A new Map object with the specified center coordinates, zoom level, and base layer is
     * being returned from the initMap function.
     */
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


    /**
     * The `initMenu` function creates a vertical toolbar with two items - one for showing the user's
     * location on a map and another for toggling the display of locations on the map.
     * @returns A new control.Toolbar object with specific configuration settings and items is being
     * returned. The toolbar is set to be vertical, positioned at the top left corner with a specific
     * CSS class name. It includes two items with associated click functions: one for managing the
     * user's location and another for toggling the visibility of locations on the map.
     */
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
                        if ( !this.manager.mapBox.gps.status ) {

                            this.manager.mapBox.gps.startLocation()
                
                        } else {
                
                            this.manager.mapBox.gps.status = false
                            this.manager.mapBox.gps.marker.remove()
                            this.manager.mapBox.gps.marker = null
                            this.manager.mapBox.gps.accuracyLayer.remove()
                            this.manager.mapBox.gps.stopWatch()
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


    /**
     * The function `setMarker` creates a new Marker object with a specified coordinate and marker
     * symbol based on a given type.
     * @param coordinate - The `coordinate` parameter is the location where you want to place the
     * marker on a map. It typically consists of latitude and longitude values that specify a point on
     * the Earth's surface.
     * @param [type=default] - The `type` parameter in the `setMarker` function is used to specify the
     * type of marker symbol to be used. By default, if no `type` is provided, it will use the
     * 'default' marker symbol.
     * @returns A new Marker object with the specified coordinate and symbol based on the
     * markerTemplate for the given type.
     */
    setMarker(coordinate, type = 'default') {
        return new Marker( coordinate, {
            'symbol' : markerTemplate(type)
        })
    }


    /**
     * The function setHtmlMarker creates a UI marker with specified content and alignment at a given
     * coordinate.
     * @param coordinate - The `coordinate` parameter is the location where you want to place the HTML
     * marker on the map. It typically consists of latitude and longitude values that specify the
     * position on the map.
     * @param content - The `content` parameter in the `setHtmlMarker` function is the HTML content
     * that you want to display within the marker. This can include text, images, links, or any other
     * HTML elements that you want to show at the specified coordinate on the map.
     * @param [alignment=top] - The `alignment` parameter in the `setHtmlMarker` function determines
     * the vertical alignment of the marker content relative to the marker's position on the map. The
     * possible values for the `alignment` parameter are:
     * @returns A new instance of `ui.UIMarker` with the specified properties is being returned.
     */
    setHtmlMarker(coordinate, content, alignment = 'top') {

        return new ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content,
            'verticalAlignment' : alignment
        })
    }


    /**
     * The addMarkerLongPress function sets a timer to save a marker coordinate if the mouse has not
     * moved within 800 milliseconds.
     * @param e - The parameter `e` in the `addMarkerLongPress` function likely represents an event
     * object that is passed when a long press event occurs. This event object may contain information
     * such as the coordinates of where the long press occurred.
     */
    addMarkerLongPress( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouseHasMoved ) {
                // console.log(e.coordinate)
                this.manager.saveMarker( e.coordinate )
            }
        }, 800)

        this.mouseHasMoved = false
    }
}