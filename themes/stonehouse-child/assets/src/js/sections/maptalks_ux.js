// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker, LineString } from 'maptalks'
import { ClusterLayer } from 'maptalks.markercluster/dist/maptalks.markercluster'
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer'

import { defaults } from '../constants/defaults'
import { GPS } from './inc/GPS'
import { Route } from './inc/Route'
import { ManageLocation } from './inc/ManageLocation'
import { createElementFromHTML } from '../utils/dom_from_string'
import { MapBoxMiddleware } from './inc/MapBoxMiddleware'

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

    manageLocation;

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

        this.gps = new GPS(Polygon)
        this.manageLocation = new ManageLocation(defaults)
        this.route = new Route(new VectorLayer('line').addTo(this.map))
        
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


    focus_house_marker( item_coord, marker_coord ) {

        const lat_length = item_coord.lat.toString().split(".")[1].length
        const lng_length = item_coord.lng.toString().split(".")[1].length

        if (
            item_coord.lat === parseFloat(marker_coord.x.toFixed(lat_length)) &&
            item_coord.lng === parseFloat(marker_coord.y.toFixed(lng_length))
        ) {
            
            this.map.animateTo({
                center: marker_coord,
                zoom: 13,
            }, {
                duration: 800
            })
        }
    }


    listen_hover_item_marker( item ) {

        const item_coord = {
            lat: parseFloat( item.querySelector('.location .lat').getAttribute('lat') ),
            lng: parseFloat( item.querySelector('.location .lng').getAttribute('lng') ),
        }

        item.addEventListener('mouseenter', ev => 

            this.cluster.forEach( async marker => 
                this.focus_house_marker( item_coord, marker.getCoordinates() )
            )
        )
    }


    saved_houses_listeners() {

        const houses = this.details.querySelectorAll('.house')

        houses.forEach( item => this.listen_hover_item_marker( item ) )
    }


    start_navigation(ev) {
        console.log(ev)
    }

    prepare_navigation( destination ) {

        // hide other markers
        this.cluster.forEach( async marker => {

            const coord = defaults.coord( marker.getCoordinates() )

            if (
                coord.lat !== destination.lat &&
                coord.lng !== destination.lng
            ) marker.hide()
        })

        const dom = this.route.popup.getDOM()
        const close = dom.querySelector('.close-btn')

        const items_container = dom.querySelector('.routing-items')
        items_container.querySelectorAll('.btn-routing').forEach(async item => item.remove())
        items_container.classList.add('justify-around')

        const btn_start_nav = createElementFromHTML( defaults.popupStartNavigation )
        btn_start_nav.addEventListener('click', ev => this.start_navigation(ev), false)


        close.addEventListener('click', ev => {

            this.cluster.forEach( async marker => marker.show() )

            this.route.vector.removeGeometry( this.route.selected_line )

        }, false)

        items_container.append( btn_start_nav )
    }


    draw_route( profile, from, to ) {

        const middleware = new MapBoxMiddleware(this.route, LineString, 'red')

        middleware.line_route( profile, from, to ).then(line => {

            line.addTo(this.route.vector)

            this.route.selected_line = line

            ! this.gps.need_extent && this.map.fitExtent(line.getExtent())

            this.prepare_navigation( to )
        })
    }


    build_routing_path( destination, profile ) {

        if ( ! this.gps.status ) {

            ! this.gps.marker && this.start_location()

            // Observe Variable => this.gps.marker => for inescate route api request
            let observer_id
            const tick = ( marker ) => {

                if ( marker ) {

                    const coord = this.gps.marker.getCoordinates()

                    this.draw_route( profile, defaults.coord(coord), destination )
                    clearInterval(observer_id)
                }
            }
            observer_id = setInterval( () => tick(this.gps.marker), 10 )

        } else {

            const coord = this.gps.marker.getCoordinates()

            this.draw_route( profile, defaults.coord(coord), destination )
        }
    }


    click_saved_marker(ev) {

        this.route.popup && this.route.popup.remove()

        const marker = ev.target
        const coord = marker.getCoordinates()
        const destination = defaults.coord(coord)

        const content = createElementFromHTML( defaults.popupRouting )

        const btn_walking = content.querySelector('.btn-walking')
        const btn_cycling = content.querySelector('.btn-cycling')
        const btn_car = content.querySelector('.btn-car')

        btn_walking.addEventListener('click', ev => this.build_routing_path( destination, 'mapbox/walking' ), false)
        btn_cycling.addEventListener('click', ev => this.build_routing_path( destination, 'mapbox/cycling' ), false)
        btn_car.addEventListener('click', ev => this.build_routing_path( destination, 'mapbox/driving-traffic' ), false)

        const close = content.querySelector('.close-btn')
        this.route.popup = this.set_html_marker( coord, content )

        close.addEventListener('click', ev => this.route.popup.remove(), false)

        this.route.popup.addTo(this.map).show()
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


    start_location() {

        // Emit Event "MyPosition"
        this.gps.watch()
        this.gps.status = true
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
                        if ( !this.gps.status ) {

                            this.start_location()
                
                        } else {
                
                            this.gps.status = false
                            this.gps.marker.remove()
                            this.gps.marker = null
                            this.gps.accuracyLayer.remove()
                            this.gps.stopWatch()
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


    location( ev ) {

        const res = ev.detail

        // fix browser on multiple click for geoloation on watching position
        if( res?.lng && res?.lat ) {

            const coord = new Coordinate([res.lng, res.lat]) 

            if( ! this.gps.marker ) {

                this.gps.marker = this.set_html_marker(coord, defaults.point_marker, 'middle')
                this.gps.marker.addTo(this.map).show()

            } else {

                this.gps.marker.setCoordinates(coord)
                this.gps.accuracyLayer.remove()
            }

            const circle = this.gps.circular(coord, res.accuracy)
            this.gps.accuracyLayer = new VectorLayer('vector', circle).addTo(this.map)

            this.gps.need_extent && this.map.fitExtent(circle.getExtent())
            this.gps.need_extent = false
        }
    }


    set_marker(coordinate, type = 'default') {

        return new Marker( coordinate, {
            'symbol' : defaults.marker(type)
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

        if ( this.manageLocation.locationSaved ) {

            if ( response.status === 'success' ) {

                const item = createElementFromHTML(
                    defaults.house_item(
                        response.message.id,
                        response.message.title,
                        response.message.location.lat,
                        response.message.location.lng
                    )
                )

                this.listen_hover_item_marker( item )
                marker.addTo(this.cluster)
                marker.on('click', ev => this.click_saved_marker(ev))
                this.details.append(item)
            }

            this.fix_empty_houses([true])
        }
    }


    set_save_marker(coordinate) {

        this.manageLocation.reset()

        const saveLocation = this.manageLocation.saveLocation

        saveLocation.content = createElementFromHTML( defaults.popupSaveHose )
        saveLocation.saveBtn = saveLocation.content.querySelector('.btn-add-house')
        saveLocation.closeBtn = saveLocation.content.querySelector('.close-btn')

        saveLocation.marker = this.set_marker(coordinate)
        saveLocation.popup = this.set_html_marker(coordinate, saveLocation.content)
        saveLocation.point = this.set_html_marker(coordinate, defaults.point_marker, 'middle')

        saveLocation.saveBtn.addEventListener('click', async ev => this.save_location(
            saveLocation.marker,
            await this.manageLocation.handle_create_location( coordinate, saveLocation.marker )
        ), false)

        saveLocation.closeBtn.addEventListener('click', ev => this.manageLocation.reset(), false)

        saveLocation.marker.addTo(this.cluster)
        saveLocation.popup.addTo(this.map).show()
        saveLocation.point.addTo(this.map).show()
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