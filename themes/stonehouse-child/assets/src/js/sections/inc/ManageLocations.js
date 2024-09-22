import { crud } from '../../constants/crud'
import { Location } from './elements/Location'
import { popupRouting } from './items/popups/routing'
import { popupSaveHose } from './items/popups/saveHose'
import { pointMarker } from './items/pointMarker'
import { houseItem } from './items/houseItem'


export class ManageLocations extends Location {


    locationSaved = false


    constructor({ map, menu, cluster, mapBox, Coordinate, markerTemplate, coord, createElementFromHTML, setMarker, setHtmlMarker }) {

        super()

        this.details = document.querySelector('.details')

        this.map = map
        this.menu = menu
        this.cluster = cluster
        this.mapBox = mapBox

        this.Coordinate = Coordinate

        this.markerTemplate = markerTemplate
        this.coord = coord
        this.createElementFromHTML = createElementFromHTML
        this.setMarker = setMarker
        this.setHtmlMarker = setHtmlMarker

        this.initSavedLocations(stonehouse_data)
        this.fixEmptyHouses(stonehouse_data.locations)
    }


    initSavedLocations(houses) {

        const addSavedMarker = (item) => {

            const {lat, lng} = item.location
            const coord = new this.Coordinate([lat, lng])

            const marker = this.setMarker(coord, 'success')
            marker.on('click', ev => this.clickSavedMarker(ev))
            marker.addTo(this.cluster)
        }

        Object.values(houses.locations).forEach( async item => addSavedMarker(item) )

        this.savedLocationsListeners()
    }


    fixEmptyHouses(locations) {

        let menuDom = this.menu.getDOM()
        const li = menuDom.querySelector('#houses-svg-icon').closest('li')

        if ( ! locations.length )
            li.classList.add('disabled')

        else
            li.classList.remove('disabled')
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


    handleCreateLocation = async ( coordinate, marker ) => {

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


    savedLocationsListeners() {

        const locations = this.details.querySelectorAll('.house')

        locations.forEach( item => this.listenHoverItemMarker( item ) )
    }


    clickSavedMarker(ev) {

        this.mapBox.popup && this.mapBox.popup.remove()

        const marker = ev.target
        const coord = marker.getCoordinates()
        const destination = this.coord(coord)

        const content = this.createElementFromHTML( popupRouting() )

        const btnWalking = content.querySelector('.btn-walking')
        const btnCycling = content.querySelector('.btn-cycling')
        const btnCar = content.querySelector('.btn-car')

        btnWalking.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/walking' ), false)
        btnCycling.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/cycling' ), false)
        btnCar.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/driving-traffic' ), false)

        const close = content.querySelector('.close-btn')
        this.mapBox.popup = this.setHtmlMarker( coord, content )

        close.addEventListener('click', ev => this.mapBox.popup.remove(), false)

        this.mapBox.popup.addTo(this.map).show()
    }


    saveLocationMenuItem(marker, response) {

        if ( this.locationSaved ) {

            if ( response.status === 'success' ) {

                const item = this.createElementFromHTML(
                    houseItem(
                        response.message.id,
                        response.message.title,
                        response.message.location.lat,
                        response.message.location.lng
                    )
                )

                this.listenHoverItemMarker( item )
                marker.addTo(this.cluster)
                marker.on('click', ev => this.clickSavedMarker(ev))
                this.details.append(item)
            }

            this.fixEmptyHouses([true])
        }
    }


    saveMarker(coordinate) {

        this.reset()

        const content = this.createElementFromHTML( popupSaveHose() )

        this.setContent( content )

        this.marker = this.setMarker(coordinate)
        this.popup = this.setHtmlMarker(coordinate, content)
        this.point = this.setHtmlMarker(coordinate, pointMarker(), 'middle')

        this.save.addEventListener('click', async ev => this.saveLocationMenuItem(
            this.marker,
            await this.handleCreateLocation( coordinate, this.marker )
        ), false)

        this.close.addEventListener('click', ev => this.reset(), false)

        this.marker.addTo(this.cluster)
        this.popup.addTo(this.map).show()
        this.point.addTo(this.map).show()
    }
}