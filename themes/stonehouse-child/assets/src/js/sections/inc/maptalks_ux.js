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

    /**
     * @param {Array<VALUE>} arr The array to modify.
     * @param {!Array<VALUE>|VALUE} data The elements or arrays of elements to add to arr.
     * @template VALUE
     */
    extend(arr, data) {

        const extension = Array.isArray(data) ? data : [data];
        const length = extension.length;

        for (let i = 0; i < length; i++) {
            arr[arr.length] = extension[i];
        }
    }

    /**
     * Converts degrees to radians.
     *
     * @param {number} angleInDegrees Angle in degrees.
     * @return {number} Angle in radians.
     */
    toRadians(angleInDegrees) {
        return (angleInDegrees * Math.PI) / 180;
    }

    /**
     * Converts radians to to degrees.
     *
     * @param {number} angleInRadians Angle in radians.
     * @return {number} Angle in degrees.
     */
    toDegrees(angleInRadians) {
        return (angleInRadians * 180) / Math.PI;
    }

    /**
     * Returns the coordinate at the given distance and bearing from `c1`.
     *
     * @param {import("./coordinate.js").Coordinate} c1 The origin point (`[lon, lat]` in degrees).
     * @param {number} distance The great-circle distance between the origin
     *     point and the target point.
     * @param {number} bearing The bearing (in radians).
     * @param {number} [radius] The sphere radius to use.  Defaults to the Earth's
     *     mean radius using the WGS84 ellipsoid.
     * @return {import("./coordinate.js").Coordinate} The target point.
     */
    offset(c1, distance, bearing, radius) {

        const DEFAULT_RADIUS = 6371008.8;

        radius = radius || DEFAULT_RADIUS;

        const lat1 = this.toRadians(c1[1]);
        const lon1 = this.toRadians(c1[0]);
        const dByR = distance / radius;
        const lat = Math.asin(
            Math.sin(lat1) * Math.cos(dByR) +
            Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing),
        );

        const lon = lon1 + Math.atan2(
            Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
            Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat),
        );

        return [this.toDegrees(lon), this.toDegrees(lat)];
    }
  

    circular(center, radius, n, sphereRadius) {
        n = n ? n : 64;

        const flatCoordinates = [];

        // che OpenLayer ci perdoni per i nostri peccati
        for (let i = 0; i < n; ++i) {

            this.extend(
                flatCoordinates,
                this.offset(center, radius, (2 * Math.PI * i) / n, sphereRadius),
            );
        }

        flatCoordinates.push(flatCoordinates[0], flatCoordinates[1]);

        const result = flatCoordinates.reduce((acc, _, i, array) => {

            if (i % 2 === 0) {
                acc.push([array[i], array[i + 1]])
            }

            return acc
        }, [])

        return new maptalks.Polygon([ result ], {
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

                            
                            const coordinate = new maptalks.Coordinate({ x: res.lng, y: res.lat })

                            const marker2 = this.set_marker(coordinate, defaults.point_marker, 'middle')
                            marker2.addTo(this.map).show()

                            
                            const coords = [res.lng, res.lat];
                            const accuracy = this.circular(coords, res.position.coords.accuracy);

                            new maptalks.VectorLayer('vector', accuracy).addTo(this.map)
                            this.map.fitExtent(accuracy.getExtent())

                            // this.map.animateTo({
                            //     center: [res.lng, res.lat],
                            //     zoom: 13,
                            //     pitch: 0,
                            //     bearing: 0
                            // }, {
                            //     duration: 900
                            // })
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
                console.log(e.coordinate)
                this.set_save_marker( e.coordinate )
            }
        }, 800)

        this.mouse_has_moved = false
    }


}