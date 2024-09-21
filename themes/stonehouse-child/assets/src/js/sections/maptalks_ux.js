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
        this.details = document.querySelector('.details')

        this.map = this.init_map(initial_location)
        
        // Bad Clusters animations
        this.cluster = new ClusterLayer('cluster').addTo(this.map)
        this.cluster.config('animationDuration', 1)

        this.init_saved_hauses(stonehouse_data)

        this.menu = this.init_menu()
        this.menu.addTo(this.map)
        this.fix_empty_houses(stonehouse_data.locations)

        // JS DOM reorganization on progress.... 
        this.map_box = new MapBoxRoutes({
            map: this.map,
            cluster: this.cluster,
            location: new ManageLocation({
                map: this.map,
                cluster: this.cluster,
                markerTemplate
            }),
            gps: new GPS( this.map, this.set_html_marker, Coordinate, Polygon, VectorLayer ),
            LineVector: new VectorLayer('line').addTo(this.map),
            LineString,
            createElementFromHTML,
            lineColor: 'red'
        })

        this.map.on('mousedown', ev => this.add_marker_long_press(ev))
        this.map.on('mousemove', () => this.mouse_has_moved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement )
            this.map.on('contextmenu', e => this.set_save_marker( e.coordinate ))

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


    saved_houses_listeners() {

        const houses = this.details.querySelectorAll('.house')

        houses.forEach( item => this.map_box.location.listenHoverItemMarker( item ) )
    }


    click_saved_marker(ev) {

        this.map_box.popup && this.map_box.popup.remove()

        const marker = ev.target
        const coord = marker.getCoordinates()
        const destination = defaults.coord(coord)

        const content = createElementFromHTML( defaults.popupRouting )

        const btn_walking = content.querySelector('.btn-walking')
        const btn_cycling = content.querySelector('.btn-cycling')
        const btn_car = content.querySelector('.btn-car')

        btn_walking.addEventListener('click', ev => this.map_box.buildRoutingPath( destination, 'mapbox/walking' ), false)
        btn_cycling.addEventListener('click', ev => this.map_box.buildRoutingPath( destination, 'mapbox/cycling' ), false)
        btn_car.addEventListener('click', ev => this.map_box.buildRoutingPath( destination, 'mapbox/driving-traffic' ), false)

        const close = content.querySelector('.close-btn')
        this.map_box.popup = this.set_html_marker( coord, content )

        close.addEventListener('click', ev => this.map_box.popup.remove(), false)

        this.map_box.popup.addTo(this.map).show()
    }


    init_saved_hauses(houses) {

        const add_saved_marker = (item) => {

            const {lat, lng} = item.location
            const coord = new Coordinate([lat, lng])

            const marker = this.set_marker(coord, 'success')
            marker.on('click', ev => this.click_saved_marker(ev))
            marker.addTo(this.cluster)
        }

        Object.values(houses.locations).forEach( async item => add_saved_marker(item) )

        this.saved_houses_listeners()
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


    fix_empty_houses(locations) {

        let menu_dom = this.menu.getDOM()
        const li = menu_dom.querySelector('#houses-svg-icon').closest('li')

        if ( ! locations.length )
            li.classList.add('disabled')

        else
            li.classList.remove('disabled')
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







    save_location(marker, response) {

        if ( this.map_box.location.locationSaved ) {

            if ( response.status === 'success' ) {

                const item = createElementFromHTML(
                    defaults.house_item(
                        response.message.id,
                        response.message.title,
                        response.message.location.lat,
                        response.message.location.lng
                    )
                )

                this.map_box.location.listenHoverItemMarker( item )
                marker.addTo(this.cluster)
                marker.on('click', ev => this.click_saved_marker(ev))
                this.details.append(item)
            }

            this.fix_empty_houses([true])
        }
    }


    set_save_marker(coordinate) {

        this.map_box.location.reset()

        const content = createElementFromHTML( defaults.popupSaveHose )

        this.map_box.location.content = content
        this.map_box.location.save = this.map_box.location.getSave()
        this.map_box.location.close = this.map_box.location.getClose()

        this.map_box.location.marker = this.set_marker(coordinate)
        this.map_box.location.popup = this.set_html_marker(coordinate, content)
        this.map_box.location.point = this.set_html_marker(coordinate, defaults.point_marker, 'middle')

        this.map_box.location.save.addEventListener('click', async ev => this.save_location(
            this.map_box.location.marker,
            await this.map_box.location.handle_create_location( coordinate, this.map_box.location.marker )
        ), false)

        this.map_box.location.close.addEventListener('click', ev => this.map_box.location.reset(), false)

        this.map_box.location.marker.addTo(this.cluster)
        this.map_box.location.popup.addTo(this.map).show()
        this.map_box.location.point.addTo(this.map).show()
    }






    add_marker_long_press( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouse_has_moved ) {
                // console.log(e.coordinate)
                this.set_save_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }
}