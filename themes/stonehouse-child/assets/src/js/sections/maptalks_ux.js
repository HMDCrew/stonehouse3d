// import * as maptalks from 'maptalks'
import { TileLayer, Map, Polygon, control, VectorLayer, ui, Coordinate, Marker } from 'maptalks'
import { defaults } from '../constants/defaults'
import { MyLocation } from './inc/myLocation'

import { crud } from '../constants/crud'

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

export class MaptalksUX {

    mapContainer;

    map;
    baseLayer;
    menu;

    myLocation
    myLocationMarker;
    myLocationAccuracyLayer;


    mouse_has_moved = null
    timerId = null


    constructor() {

        this.mapContainer = document.querySelector('.maps')

        this.map = this.init_map()
        this.markers = new VectorLayer('markers').addTo(this.map)
        this.init_saved_hauses(stonehouse_data)

        this.menu = this.init_menu()
        this.myLocation = new MyLocation()

        this.map.on('mousedown', ev => this.add_marker_long_press(ev))
        this.map.on('mousemove', () => this.mouse_has_moved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement ) {

            this.map.on('contextmenu', e => this.set_save_marker( e.coordinate ))
        }

        this.menu.addTo(this.map);
    }


    init_map() {

        this.baseLayer = new TileLayer('base', {
            urlTemplate: defaults.geografica,
            subdomains: ["a","b","c","d", "e"],
            attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
        })

        return new Map('stonemap', {
            center: [ -0.113049, 51.498568 ],
            zoom: 14,
            baseLayer: this.baseLayer
        })
    }

    init_saved_hauses(houses) {

        const add_saved_marker = (item) => {

            const {lat, lng} = item.location
            const coord = new Coordinate([lat, lng])

            const marker = this.set_marker(coord, 'success')
            marker.addTo(this.markers)
        }

        Object.values(houses.locations).forEach( async item => add_saved_marker(item) )
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

                        document.addEventListener('MyPosition', ev => this.location(ev))

                        // Emit Event "MyPosition"
                        this.myLocation.watch()
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


    circular(center, radius) {
        return new Polygon([ this.myLocation.circular(center, radius) ], {
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

            if( ! this.myLocationMarker ) {

                this.myLocationMarker = this.set_html_marker(coord, defaults.point_marker, 'middle')
                this.myLocationMarker.addTo(this.map).show()

            } else {

                this.myLocationMarker.setCoordinates(coord)
                this.myLocationAccuracyLayer.remove()
            }

            const circle = this.circular(coord, res.accuracy)
            this.myLocationAccuracyLayer = new VectorLayer('vector', circle).addTo(this.map)

            this.map.fitExtent(circle.getExtent())
        }
    }


    handle_create_location = async ( save_btn, coordinate ) => {

        let falied = true
        save_btn.classList.add('loading')

        await crud.create_location( coordinate.x, coordinate.y ).then( res => {

            res = JSON.parse(res)

            if ( res.status === 'success' ) {

                falied = false
                console.log(res)

                save_btn.classList.remove('loading')
                save_btn.classList.add('loaded')
            } else {

                save_btn.classList.remove('loading')
                save_btn.classList.add('error')
            }
        })

        return falied
    }


    set_marker(coordinate, type = 'default') {

        return new Marker( coordinate, {
            'symbol' : defaults.markers(type)
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


    set_save_marker(coordinate) {

        const content = defaults.popupMarker
        const save_btn = content.querySelector('.btn-add-house')
        const close_btn = content.querySelector('.close-btn')

        const marker = this.set_marker(coordinate)
        const popup = this.set_html_marker(coordinate, content)
        const point = this.set_html_marker(coordinate, defaults.point_marker, 'middle')

        let falied = true
        save_btn.addEventListener('click', async ev => falied = await this.handle_create_location( save_btn, coordinate ), false)

        close_btn.addEventListener('click', ev => {

            if ( falied ) {
                marker.remove()
                popup.remove()
                point.remove()
            } else {
                content.querySelector('.popup').remove()
                popup.remove()
                point.remove()
            }
        }, false)

        marker.addTo(this.markers)
        popup.addTo(this.map).show()
        point.addTo(this.map).show()
    }


    add_marker_long_press( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouse_has_moved ) {
                console.log(e.coordinate)
                this.set_save_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }
}