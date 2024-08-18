import * as maptalks from 'maptalks'
import { defaults } from '../../constants/defaults'

// urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
// topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
//      fix: topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
// geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
// roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",

export class MaptalksUX {

    map;
    baseLayer;

    mouse_has_moved = null
    timerId = null

    constructor() {

        this.map = this.get_map()

        this.map.on('mousedown', ev => this.add_marker_long_press(ev))
        this.map.on('mousemove', () => this.mouse_has_moved = true)
        this.map.on('mouseup', () => clearTimeout(this.timerId))

        // Mobile Add Marker
        if ( 'ontouchstart' in document.documentElement ) {

            this.map.on('contextmenu', e => this.set_marker( e.coordinate ))

        } else {

            // Disable right click on Desktop
            this.map.addEventListener('contextmenu', ev => { ev.preventDefault() })
        }
    }


    get_map() {

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


    set_marker(coordinate, contentHTML = false) {

        const content = (
            `<div class="content-marker">
                <span class="popup">
                    <button>btn</button>
                    <span>popup</span>
                </span>${contentHTML || defaults.marker}
            </div>`
        )

        const marker = new maptalks.ui.UIMarker(coordinate, {
            'draggable'         : false,
            'single'            : false,
            'content'           : content, // contentHTML || defaults.marker,
            'verticalAlignment' : 'top'
        })

        marker.addTo(this.map).show()
    }

    add_marker_long_press( e ) {

        this.timerId = setTimeout(() => {

            if ( ! this.mouse_has_moved ) {
                this.set_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }
}