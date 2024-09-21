import { crud } from '../../constants/crud'
import { Location } from './elements/Location'
import { popupRouting } from './items/popups/routing'
import { popupSaveHose } from './items/popups/saveHose'
import { pointMarker } from './items/PointMarker'

import { HouseItem } from './items/HouseItem'


export class ManageLocation extends Location {


    locationSaved = false


    constructor({ map, menu, cluster, map_box, Coordinate, markerTemplate, coord, createElementFromHTML, set_marker, set_html_marker }) {

        super()

        this.details = document.querySelector('.details')

        this.map = map
        this.menu = menu
        this.cluster = cluster
        this.map_box = map_box

        this.Coordinate = Coordinate

        this.markerTemplate = markerTemplate
        this.coord = coord
        this.createElementFromHTML = createElementFromHTML
        this.set_marker = set_marker
        this.set_html_marker = set_html_marker

        this.init_saved_hauses(stonehouse_data)
        this.fix_empty_houses(stonehouse_data.locations)
    }


    reset() {

        this.marker && !this.locationSaved && this.marker.remove()
        this.popup && this.popup.remove()
        this.point && this.point.remove()
        this.content && this.content.remove()

        this.locationSaved = false

        this.content = null
        this.popup = null
        this.save = null 
        this.close = null
        this.marker = null,
        this.point = null
    }


    handle_create_location = async ( coordinate, marker ) => {

        let reponse = {status: 'error'}

        this.save.classList.add('loading')

        await crud.create_location( coordinate.x, coordinate.y ).then( res => {

            res = JSON.parse(res)
            reponse = res

            if ( res.status === 'success' ) {

                this.locationSaved = true
                // console.log(res)
                marker.setSymbol(this.markerTemplate('success'))

                this.save.classList.remove('loading')
                this.save.classList.add('loaded')
            } else {

                this.save.classList.remove('loading')

                this.save.classList.add('error')
                this.save.querySelector('.save-label').textContent = 'Error'
                
                marker.setSymbol(this.markerTemplate('error'))
            }
        })

        return reponse
    }


    focusLocationMarker( itemCoord, markerCoord ) {

        const lat_length = itemCoord.lat.toString().split(".")[1].length
        const lng_length = itemCoord.lng.toString().split(".")[1].length

        if (
            itemCoord.lat === parseFloat(markerCoord.x.toFixed(lat_length)) &&
            itemCoord.lng === parseFloat(markerCoord.y.toFixed(lng_length))
        ) {
            
            this.map.animateTo({
                center: markerCoord,
                zoom: 13,
            }, {
                duration: 800
            })
        }
    }


    listenHoverItemMarker( item ) {

        const itemCoord = {
            lat: parseFloat( item.querySelector('.location .lat').getAttribute('lat') ),
            lng: parseFloat( item.querySelector('.location .lng').getAttribute('lng') ),
        }

        item.addEventListener('mouseenter', ev => 

            this.cluster.forEach( async marker => 
                this.focusLocationMarker( itemCoord, marker.getCoordinates() )
            )
        )
    }



    




    fix_empty_houses(locations) {

        let menu_dom = this.menu.getDOM()
        const li = menu_dom.querySelector('#houses-svg-icon').closest('li')

        if ( ! locations.length )
            li.classList.add('disabled')

        else
            li.classList.remove('disabled')
    }



    saved_houses_listeners() {

        const houses = this.details.querySelectorAll('.house')

        houses.forEach( item => this.listenHoverItemMarker( item ) )
    }


    click_saved_marker(ev) {

        this.map_box.popup && this.map_box.popup.remove()

        const marker = ev.target
        const coord = marker.getCoordinates()
        const destination = this.coord(coord)

        const content = this.createElementFromHTML( popupRouting() )

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
            const coord = new this.Coordinate([lat, lng])

            const marker = this.set_marker(coord, 'success')
            marker.on('click', ev => this.click_saved_marker(ev))
            marker.addTo(this.cluster)
        }

        Object.values(houses.locations).forEach( async item => add_saved_marker(item) )

        this.saved_houses_listeners()
    }





    save_location(marker, response) {

        if ( this.locationSaved ) {

            if ( response.status === 'success' ) {

                const item = this.createElementFromHTML(
                    HouseItem(
                        response.message.id,
                        response.message.title,
                        response.message.location.lat,
                        response.message.location.lng
                    )
                )

                this.listenHoverItemMarker( item )
                marker.addTo(this.cluster)
                marker.on('click', ev => this.click_saved_marker(ev))
                this.details.append(item)
            }

            this.fix_empty_houses([true])
        }
    }


    set_save_marker(coordinate) {

        this.reset()

        const content = this.createElementFromHTML( popupSaveHose() )

        this.content = content
        this.save = this.getSave()
        this.close = this.getClose()

        this.marker = this.set_marker(coordinate)
        this.popup = this.set_html_marker(coordinate, content)
        this.point = this.set_html_marker(coordinate, pointMarker(), 'middle')

        this.save.addEventListener('click', async ev => this.save_location(
            this.marker,
            await this.handle_create_location( coordinate, this.marker )
        ), false)

        this.close.addEventListener('click', ev => this.reset(), false)

        this.marker.addTo(this.cluster)
        this.popup.addTo(this.map).show()
        this.point.addTo(this.map).show()
    }

}