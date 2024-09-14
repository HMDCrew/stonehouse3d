// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker } from 'maptalks'
import { defaults } from '../constants/defaults'
import { MyLocation } from './inc/MyLocation'
import { ManageLocation } from './inc/ManageLocation'
import { createElementFromHTML } from '../utils/dom_from_string'

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

export class MaptalksUX {

    mapContainer;
    details;

    map;
    baseLayer;
    menu;

    myLocation = {
        status: false,
        listener_ready: false,
        location: null,
        marker: null,
        accuracyLayer: null
    };

    manageLocation;

    mouse_has_moved = null
    timerId = null


    constructor(initial_location) {

        this.mapContainer = document.querySelector('.maps')
        this.details = document.querySelector('.details')

        this.map = this.init_map(initial_location)
        this.markers = new VectorLayer('markers').addTo(this.map)
        this.init_saved_hauses(stonehouse_data)

        this.menu = this.init_menu()
        this.menu.addTo(this.map)
        this.fix_empty_houses(stonehouse_data.locations)

        this.myLocation.location = new MyLocation()
        this.manageLocation = new ManageLocation(defaults)

        this.map.on('mousedown', ev => this.add_marker_long_press(ev))
        this.map.on('mousemove', () => this.mouse_has_moved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement ) {

            this.map.on('contextmenu', e => this.set_save_marker( e.coordinate ))
        }
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

            this.markers.forEach( async marker => 
                this.focus_house_marker( item_coord, marker.getCoordinates() )
            )
        )
    }


    saved_houses_listeners() {

        const houses = this.details.querySelectorAll('.house')

        houses.forEach( item => this.listen_hover_item_marker( item ) )
    }


    init_saved_hauses(houses) {

        const add_saved_marker = (item) => {

            const {lat, lng} = item.location
            const coord = new Coordinate([lat, lng])

            const marker = this.set_marker(coord, 'success')
            marker.addTo(this.markers)
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

                        if ( !this.myLocation.status ) {

                            if( ! this.myLocation.listener_ready ) {

                                document.addEventListener('MyPosition', ev => this.location(ev))
                                this.myLocation.listener_ready = true
                            }

                            // Emit Event "MyPosition"
                            this.myLocation.location.watch()
                            this.myLocation.status = true

                        } else {

                            this.myLocation.status = false
                            this.myLocation.marker.remove()
                            this.myLocation.marker = null
                            this.myLocation.accuracyLayer.remove()
                            this.myLocation.location.stopWatch()
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


    circular(center, radius) {
        return new Polygon([ this.myLocation.location.circular(center, radius) ], {
            visible : true,
            editable : true,
            cursor : 'pointer',
            draggable : false,
            dragShadow : false, // display a shadow during dragging
            drawOnAxis : null,  // force dragging stick on a axis, can be: x, y
            symbol: {
                'lineColor' : '#34495e',
                'lineWidth' : 2,
                'polygonFill' : 'rgb(135,196,240)',
                'polygonOpacity' : 0.4
            }
        })
    }


    location( ev ) {

        const res = ev.detail

        // fix browser on multiple click for geoloation on watching position
        if( res?.lng && res?.lat ) {

            const coord = new Coordinate([res.lng, res.lat]) 

            if( ! this.myLocation.marker ) {

                this.myLocation.marker = this.set_html_marker(coord, defaults.point_marker, 'middle')
                this.myLocation.marker.addTo(this.map).show()

            } else {

                this.myLocation.marker.setCoordinates(coord)
                this.myLocation.accuracyLayer.remove()
            }

            const circle = this.circular(coord, res.accuracy)
            this.myLocation.accuracyLayer = new VectorLayer('vector', circle).addTo(this.map)

            this.map.fitExtent(circle.getExtent())
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
                marker.addTo(this.markers)
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

        saveLocation.marker.addTo(this.markers)
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