// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker, LineString } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster/dist/maptalks.markercluster'

import { defaults } from '../constants/defaults'
import { GPS } from './inc/GPS'
import { ManageLocations } from './inc/ManageLocations'
import { createElementFromHTML } from '../utils/dom_from_string'
import { MapBoxRoutes } from './inc/MapBoxRoutes'
import { ViewNovigator } from './inc/ViewNovigator'
import { markerTemplate } from './inc/items/markerTemplate'
import { coord } from "./inc/items/coord"
import { decode } from "@mapbox/polyline"
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
    menu;

    mouseHasMoved = null
    timerId = null


    constructor(initialLocation) {

        this.mapContainer = document.querySelector('.maps')

        this.map = this.initMap(initialLocation)
        this.miniMap = this.initMiniMap(initialLocation)

        // Bad Clusters animations
        this.cluster = new ClusterLayer('cluster').addTo(this.map)
        this.cluster.config('animationDuration', 1)

        this.menu = this.initMenu()
        this.menu.addTo(this.map)


        // JS DOM three OR Main
        this.manager = new ManageLocations({
            UX: this,

            mapBox: new MapBoxRoutes({
                UX: this,

                navigator: new ViewNovigator({
                    UX: this,

                    gps: new GPS({
                        UX: this,

                        Coordinate,
                        Polygon,
                        VectorLayer
                    }),

                    polylineDecoder: decode
                }),

                LineVector: new VectorLayer( 'line' ).addTo( this.map ),
                
                createElementFromHTML,
                coord,
                setLineString: this.setLineString,
                polylineDecoder: decode,
                
                lineColor: 'rgba(153, 204, 255)',
                selectedLineColor: 'rgba(85, 136, 255)',
                lineColorOpaced: 'rgba(153, 204, 255, .5)',
                selectedLineColorOpaced: 'rgba(85, 136, 255, .5)',
            }),

            Coordinate,
            markerTemplate,
            coord,
            createElementFromHTML
        })


        this.map.on('mousedown', ev => this.addMarkerLongPress(ev))
        this.map.on('mousemove', () => this.mouseHasMoved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement )
            this.map.on('contextmenu', e => this.manager.saveMarker( e.coordinate ))

        this.map.sortLayers(['line', 'cluster'])
        // this.map.on('click', ev => console.log(ev.coordinate))


        this.map.on('zoomend', ev => this.updateMiniMap(ev))
        this.map.on('moveend', ev => this.updateMiniMap(ev))
        this.map.on('resize' , ev => this.updateMiniMap(ev))
        this.miniMap.on('click', ev => this.switchTileLayer())
    }


    /**
     * The function `setTileLayer` creates a new TileLayer object with specified parameters.
     * @param name - The `name` parameter is a string that represents the name of the tile layer being
     * created.
     * @param url - The `url` parameter in the `setTileLayer` function is the URL template for the tile
     * layer. It specifies the location from which the map tiles will be loaded.
     * @param [attribution] - The `attribution` parameter in the `setTileLayer` function is used to
     * specify the attribution information for the tile layer. This information typically includes
     * credits for the data source or map provider. It is displayed on the map to give credit to the
     * creators of the map tiles.
     * @returns A new TileLayer object with the specified name, URL template, subdomains, and
     * attribution is being returned.
     */
    setTileLayer( name, url, attribution = '' ) {

        return new TileLayer(name, {
            urlTemplate: url,
            subdomains: ["a","b","c","d", "e"],
            attribution: attribution
        })
    }


    /**
     * The function `setTileMap` sets the tile layers for the main map and mini map based on the
     * specified tile name.
     * @param tileName - The `setTileMap` function takes in a `tileName` parameter, which is used to
     * set the tile layer for the map. The function creates two tile layers - `miniBaseLayer` and
     * `baseLayer` based on the provided `tileName`. The `baseLayer` includes attribution
     */
    setTileMap( tileName ) {

        const miniBaseLayer = this.setTileLayer( 'mini-base', defaults[defaults.selected] )
        const baseLayer = this.setTileLayer( 'base', defaults[tileName], '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' )

        this.map.setBaseLayer(baseLayer)
        this.miniMap.setBaseLayer(miniBaseLayer)

        defaults.selected = tileName
    }

    
    /**
     * The switchTileLayer function toggles between 'geografica' and 'topografica' tile maps.
     */
    switchTileLayer() {
 
        this.setTileMap(
            'geografica' === defaults.selected
            ? 'topografica'
            : 'geografica'
        )
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
    initMap( initialLocation ) {

        const baseLayer = this.setTileLayer( 'base', defaults[defaults.selected], '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> | Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' )

        return new Map('stonemap', {
            center: [ initialLocation.longitude, initialLocation.latitude ],
            zoom: 14,
            maxZoom: 19.4,
            minZoom: 2.8,
            baseLayer: baseLayer,
            layers : [
                this.setTileLayer( 'roads', defaults.roards )
            ]
        })
    }


    /**
     * The function `initMiniMap` initializes a mini map with specific settings and disables certain
     * interactions.
     * @param initialLocation - The `initialLocation` parameter is an object that contains the
     * longitude and latitude coordinates for the center of the mini map. It is used to set the initial
     * center of the map when it is initialized.
     * @returns A new Map object with the specified configuration settings for a mini map is being
     * returned. The mini map is centered at the initial location coordinates provided, with a zoom
     * level of 11, maximum zoom level of 19.4, and minimum zoom level of 2.8. The base layer for the
     * mini map is set to 'mini-base' using the 'topografica' tile layer.
     */
    initMiniMap( initialLocation ) {

        const miniBaseLayer = this.setTileLayer( 'mini-base', defaults.geografica )

        return new Map('mini-map', {
            center: [ initialLocation.longitude, initialLocation.latitude ],
            zoom: 11,
            maxZoom: 19.4,
            minZoom: 2.8,
            attribution: '',
            baseLayer: miniBaseLayer,

            // Disable mini map interactions
            draggable : false,
            dragPan : false,
            dragRotate : false,
            dragPitch : false,
            scrollWheelZoom : false,
            touchZoom : false,
            doubleClickZoom : false
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
                        if ( !this.navigator.gps.status ) {

                            this.navigator.gps.startLocation()
                
                        } else {
                
                            this.navigator.gps.status = false
                            this.navigator.gps.marker.remove()
                            this.navigator.gps.marker = null
                            this.navigator.gps.accuracyLayer.remove()
                            this.navigator.gps.stopWatch()
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
     * The `updateMiniMap` function adjusts the zoom level and center of a mini map based on the zoom
     * level of another map.
     * @param ev - The `ev` parameter in the `updateMiniMap` function likely represents an event object
     * that is passed to the function when it is called. This event object may contain information
     * about the event that triggered the function, such as the target element, zoom level, and center
     * coordinates.
     */
    updateMiniMap( ev ) {

        if ( ! this.miniMap?.stopListeners ) {

            const zoom = (
                ev.target._zoomLevel - 3 > 0
                    ? ev.target._zoomLevel - 3
                    : 0
            )
    
            this.miniMap.panTo( ev.target.getCenter() )
            this.miniMap.setZoom( zoom, {animation: true} )
        }
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
    setMarker( coordinate, type = 'default', symbol = false ) {
        return new Marker( coordinate, {
            'symbol' : ! symbol ? markerTemplate(type) : symbol
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
    setHtmlMarker( coordinate, content, alignment = 'top' ) {

        return new ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content,
            'verticalAlignment' : alignment
        })
    }


    setLineString( steps, lineWidth = 4, lineColor ) {
        return new LineString( steps, {
            smoothness: 0.2,
            symbol: { lineColor, lineWidth }
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