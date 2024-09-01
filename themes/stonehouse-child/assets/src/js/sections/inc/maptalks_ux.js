import * as maptalks from 'maptalks'
import { defaults } from '../../constants/defaults'

import { crud } from '../../constants/crud';

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

export class MaptalksUX {

    map;
    baseLayer;
    menu;

    mouse_has_moved = null
    timerId = null

    constructor() {

        this.map = this.init_map()
        this.menu = this.init_menu()

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

        this.baseLayer = new maptalks.TileLayer('base', {
            urlTemplate: defaults.geografica,
            subdomains: ["a","b","c","d", "e"],
            attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
        })

        return new maptalks.Map('stonemap', {
            center: [ -0.113049, 51.498568 ],
            zoom: 14,
            baseLayer: this.baseLayer
        })
    }


    init_menu() {

        const menu = new maptalks.control.Toolbar({
            'vertical' : true,
            'position' : { 'top' : 20, 'left' : 20 },
            'reverseMenu' : true,
            'cssName': 'primary-map-menu',
            'items': [
                {
                    item: defaults.menu.my_location,
                    click : () => { 
                        defaults.foundMy().then(res => {
                            console.log(res)
                        })
                    }
                },
                {
                    item: defaults.menu.houses,
                    click : () => {
                        info('homes');
                    },
                }
            ]
        })
    
        function info(str) {
            // document.getElementById('info').innerHTML = str + ' is clicked';
            console.log(str)
        }

        return menu
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

    set_marker(coordinate, content, alignment = 'top') {

        return new maptalks.ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content,
            'verticalAlignment' : alignment
        })
    }

    set_save_marker(coordinate) {

        const content = defaults.popupMarker( defaults.saveLoactionBTN(), defaults.marker )
        const save_btn = content.querySelector('.btn-add-house')
        const close_btn = content.querySelector('.close-btn')

        const marker = this.set_marker(coordinate, content)
        const marker2 = this.set_marker(coordinate, defaults.point_marker, 'middle')

        let falied = true
        save_btn.addEventListener('click', async ev => falied = await this.handle_create_location( save_btn, coordinate ), false)

        close_btn.addEventListener('click', ev => {

            if ( falied ) {
                marker.remove()
                marker2.remove()
            } else {
                content.querySelector('.popup').remove()
                marker2.remove()
            }
        }, false)

        marker.addTo(this.map).show()
        marker2.addTo(this.map).show()
    }

    add_marker_long_press( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouse_has_moved ) {
                this.set_save_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }


}